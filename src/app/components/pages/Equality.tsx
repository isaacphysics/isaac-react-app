import React, {ChangeEvent, lazy, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Button, Col, Container, Input, InputGroup, Label, Row, UncontrolledTooltip} from "reactstrap";
import queryString from "query-string";
import {ifKeyIsEnter, isDefined, isStaff, siteSpecific, sanitiseInequalityState} from "../../services";
import katex from "katex";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useLocation} from "react-router";
import {Inequality, makeInequality} from 'inequality';
import {parseBooleanExpression, parseInequalityChemistryExpression, parseInequalityNuclearExpression, parseMathsExpression, ParsingError} from 'inequality-grammar';
import {selectors, useAppSelector, useGetSegueEnvironmentQuery} from "../../state";
import {EditorMode, LogicSyntax} from "../elements/modals/inequality/constants";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

function isError(p: ParsingError | any[]): p is ParsingError {
    return p.hasOwnProperty("error");
}

const equalityValidator = (input: string, editorMode: string) => {
    const openBracketsCount = input.split('(').length - 1;
    const closeBracketsCount = input.split(')').length - 1;
    let regexStr;
    const errors = [];

    let parsedExpression: ParsingError | any[];
    if (editorMode === 'maths') {
        regexStr = "[^ 0-9A-Za-z()*+,-./<=>^_±²³¼½¾×÷=]+";
        parsedExpression = parseMathsExpression(input);
    } else if (editorMode === 'logic') {
        regexStr = "[^ A-Za-z&|01()~¬∧∨⊻+.!=]+";
        parsedExpression = parseBooleanExpression(input);
    } else if (editorMode === 'chemistry') {
        regexStr = /[^ 0-9A-Za-z()[\]{}*+,-./<=>^_\\]+/;
        parsedExpression = parseInequalityChemistryExpression(input);
    } else  {
        regexStr = /[^ 0-9A-Za-z()[\]{}*+,-./<=>^_\\]+/;
        parsedExpression = parseInequalityNuclearExpression(input);
    }
    const badCharacters = new RegExp(regexStr);

    if (isError(parsedExpression) && parsedExpression.error) {
        errors.push(`Syntax error: unexpected token "${parsedExpression.error.token.value || ''}"`);
    }
    if (/\\[a-zA-Z()]|[{}]/.test(input) && ["maths", "logic"].includes(editorMode)) {
        errors.push('LaTeX syntax is not supported.');
    }
    if (/\|.+?\|/.test(input)) {
        errors.push('Vertical bar syntax for absolute value is not supported; use abs() instead.');
    }
    if (badCharacters.test(input)) {
        const usedBadChars: string[] = [];
        for(let i = 0; i < input.length; i++) {
            const char = input.charAt(i);
            if (badCharacters.test(char)) {
                if (!usedBadChars.includes(char)) {
                    usedBadChars.push(char);
                }
            }
        }
        errors.push('Some of the characters you are using are not allowed: ' + usedBadChars.join(" "));
    }
    if (openBracketsCount !== closeBracketsCount) {
        errors.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
    }
    if (/\.[0-9]/.test(input)) {
        errors.push('Please convert decimal numbers to fractions.');
    }
    return errors;
};

const Equality = () => {
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    const userPreferences = useAppSelector(selectors.user.preferences);

    const [modalVisible, setModalVisible] = useState(false);
    const initialEditorSymbols = useRef<string[]>([]);
    const [currentAttempt, setCurrentAttempt] = useState<any>({type: 'formula', value: {}, pythonExpression: ''});
    const [editorSyntax, setEditorSyntax] = useState<LogicSyntax>('logic');
    const [textInput, setTextInput] = useState('');
    const user = useAppSelector(selectors.user.orNull);
    // Does this really need to be a state variable if it is immutable?
    const [editorMode, setEditorMode] = useState<EditorMode>((queryParams.mode as EditorMode) || siteSpecific('maths', 'logic'));
    const {data: segueEnvironment} = useGetSegueEnvironmentQuery();

    /*** Text based input stuff */
    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();
    const [inputState, setInputState] = useState(() => ({pythonExpression: '', userInput: '', valid: true}));

    interface ChildrenMap {
        children: {[key: string]: ChildrenMap};
    }

    function countChildren(root: ChildrenMap) {
        let q = [root];
        let count = 1;
        while (q.length > 0) {
            const e = q.shift();
            if (!e) continue;

            const c = Object.keys(e.children).length;
            if (c > 0) {
                count = count + c;
                q = q.concat(Object.values(e.children));
            }
        }
        return count;
    }

    function updateState(state: any) {
        if (["maths", "logic"].includes(editorMode)) {
            const newState = sanitiseInequalityState(state);
            const pythonExpression = newState?.result?.python || "";
            const previousPythonExpression = currentAttempt.value?.result?.python || "";
            if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
                setCurrentAttempt({ type: 'formula', value: JSON.stringify(newState), pythonExpression });
            }
            initialEditorSymbols.current = state.symbols;
        } else {
            const newState = sanitiseInequalityState(state);
            const mhchemExpression = newState?.result?.mhchem || "";
            const previousMhchemExpression = currentAttempt.value?.result?.mhchem || "";
            if (!previousMhchemExpression || previousMhchemExpression !== mhchemExpression) {
                setCurrentAttempt({ type: 'chemicalFormula', value: JSON.stringify(newState), mhchemExpression });
            }
            initialEditorSymbols.current = state.symbols;
        }
    }

    const updateEditor = (e: ChangeEvent<HTMLInputElement>) => {
        setEditorMode(e.target.value as EditorMode); 
        if (sketchRef.current) {
            sketchRef.current.editorMode = e.target.value as EditorMode;
        }
    };

    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        _updateEquation(e.target.value);
    };

    const _updateEquation = (input: string) => {
        // const pycode = e.target.value;
        setTextInput(input);
        setInputState({...inputState, pythonExpression: input, userInput: textInput});

        let parsedExpression: any[] | ParsingError | undefined;
        if (editorMode === 'maths') {
            parsedExpression = parseMathsExpression(input);
        } else if (editorMode === 'logic') {
            parsedExpression = parseBooleanExpression(input);
        } else if (editorMode === 'chemistry') {
            parsedExpression = parseInequalityChemistryExpression(input);
        } else if (editorMode === 'nuclear') {
            parsedExpression = parseInequalityNuclearExpression(input);
        }

        if (!isDefined(parsedExpression) || !(isError(parsedExpression) || (parsedExpression.length === 0 && input !== ''))) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                setCurrentAttempt({ type: 'formula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                initialEditorSymbols.current = [];
            } else if (isDefined(parsedExpression) && parsedExpression.length === 1) {
                // This and the next one are using pycode instead of textInput because React will update the state whenever it sees fit
                // so textInput will almost certainly be out of sync with pycode which is the current content of the text box.
                if (sketchRef.current) {
                    sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, input);
                }
            } else if (isDefined(parsedExpression)) {
                if (sketchRef.current) {
                    const sizes = parsedExpression.map(countChildren);
                    const i = sizes.indexOf(Math.max.apply(null, sizes));
                    sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, input);
                }
            }
        }
    };

    useEffect(() => {
        if (sketchRef.current) {
            sketchRef.current.logicSyntax = editorSyntax;
        }
    }, [editorSyntax]);

    useLayoutEffect(() => {
        if (!allowTextInput) return; // as the ref won't be defined

        if (!isDefined(hiddenEditorRef.current)) {
            throw new Error("Unable to initialise inequality; target element not found.");
        }

        const {sketch, p} = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            [],
            {
                editorMode: editorMode,
                textEntry: true,
                fontItalicPath: '/assets/common/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/common/fonts/STIXGeneral-Regular.ttf',
            }
        );
        if (!isDefined(sketch)) throw new Error("Unable to initialize Inequality.");

        sketch.log = { initialState: [], actions: [] };
        sketch.onNewEditorState = updateState;
        sketch.onCloseMenus = () => undefined;
        sketch.isUserPrivileged = () => true;
        sketch.onNotifySymbolDrag = () => undefined;
        sketch.isTrashActive = () => false;

        sketchRef.current = sketch;

        return () => {
            if (sketchRef.current) {
                sketchRef.current.onNewEditorState = () => null;
                sketchRef.current.onCloseMenus = () => null;
                sketchRef.current.isTrashActive = () => false;
                sketchRef.current = null;
            }
            p.remove();
        };
    }, [hiddenEditorRef.current]);
    /*** End of text based input stuff */

    const availableSymbols = queryParams.symbols && (queryParams.symbols as string).split(',').map(s => s.trim());

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '' } };
        }
    }

    const closeModal = () => {
        document.body.style.overflow = "auto";
        setModalVisible(false);
    };

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;
    const allowTextInput = ['maths', 'logic'].includes(editorMode) || (userPreferences?.DISPLAY_SETTING?.CHEM_TEXT_ENTRY && ['chemistry', 'nuclear'].includes(editorMode));

    return <div>
        <Container>
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Equation editor demo page" icon={{type: "icon", icon: "icon-concept"}} />
                </Col>
            </Row>
            <Row>
                <Col md={3} className="py-4 syntax-picker mode-picker">
                    <div>
                        <Label for="inequality-mode-select">Editor mode:</Label>
                        <Input type="select" name="mode" id="inequality-mode-select" value={editorMode as string} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateEditor(e)}> 
                            <option value="maths">Maths</option>
                            <option value="chemistry">Chemistry</option>
                            <option value="nuclear">Nuclear Physics</option>
                            <option value="logic">Boolean Logic</option>
                        </Input>
                    </div>
                    {(editorMode === 'logic') && <div className="mt-4">
                        <Label for="inequality-syntax-select">Boolean Logic Syntax</Label>
                        <Input type="select" name="syntax" id="inequality-syntax-select" value={editorSyntax} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEditorSyntax(e.target.value as LogicSyntax); _updateEquation(textInput); } }>
                            <option value="logic">Boolean Logic</option>
                            <option value="binary">Digital Electronics</option>
                        </Input>
                    </div>}
                </Col>
                <Col md={8} className="pb-4 pt-md-4 question-panel">
                    {allowTextInput && <div className="eqn-editor-input mt-md-4">
                        <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                        <InputGroup className="my-2 align-items-center">
                            <Input className="py-4" type="text" onChange={updateEquation} value={textInput}
                                placeholder="Type your expression here"/>
                            <>
                                {siteSpecific(
                                    <Button type="button" className="eqn-editor-help d-flex align-items-center" id="inequality-help" size="sm" tag="a" href="/solving_problems#symbolic_text">?</Button>,
                                    <i id={"inequality-help"} className="icon icon-info icon-sm h-100 ms-3" />
                                )}
                                <UncontrolledTooltip placement="top" autohide={false} target='inequality-help'>
                                    Here are some examples of expressions you can type:<br />
                                    {editorMode === 'maths' && <> <br />
                                        a*x^2 + b x + c <br />
                                        (-b ± sqrt(b**2 - 4ac)) / (2a) <br />
                                        1/2 mv**2 <br />
                                        log(x_a, 2) == log(x_a) / log(2) <br />
                                        <br /> </>}
                                    {editorMode === 'chemistry' && <>
                                        H2O<br />
                                        2 H2 + O2 -&gt; 2 H2O<br />
                                        CH3(CH2)3CH3<br />
                                        {"NaCl(aq) -> Na^{+}(aq) +  Cl^{-}(aq)"}<br /> </>}
                                    {editorMode === 'nuclear' && <>
                                        {"^{238}_{92}U -> ^{4}_{2}\\alphaparticle + _{90}^{234}Th"}<br />
                                        {"^{0}_{-1}e"}<br />
                                        {"\\gammaray"}<br /> </>}
                                    {editorMode === 'logic' && <>
                                        <br />
                                        A AND (B XOR NOT C)<br />
                                        A &amp; (B ^ !C)<br />
                                        T &amp; ~(F + A)<br />
                                        1 . ~(0 + A)<br /> </>}
                                    As you type, the box below will preview the result.
                                </UncontrolledTooltip>
                            </>
                        </InputGroup>
                        <QuestionInputValidation userInput={textInput} validator={(i: string) => equalityValidator(i, editorMode)} />
                    </div>}
                    <div className="equality-page">
                        <div
                            role="button" className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''} ${!allowTextInput && 'mt-4'}`} tabIndex={0}
                            onClick={() => setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => setModalVisible(true))}
                            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : `<span>${allowTextInput ? 'or c' : 'C'}lick here to enter a formula</span>` }}
                        />
                        {modalVisible && <InequalityModal
                            close={closeModal}
                            onEditorStateChange={(state: any) => {
                                setCurrentAttempt(["maths", "logic"].includes(editorMode) ? {
                                    type: 'logicFormula',
                                    value: JSON.stringify(state),
                                    pythonExpression: (state && state.result && state.result.python) || "",
                                    symbols: [],
                                } : { 
                                    type: 'chemicalFormula', 
                                    value: JSON.stringify(state), 
                                    mhchemExpression: (state && state.result && state.result.mhchem) || "" 
                                });
                                setTextInput(["maths", "logic"].includes(editorMode) ? (state?.result?.python || '') : (state?.result?.mhchem || ''));
                                initialEditorSymbols.current = state.symbols;
                            }}
                            availableSymbols={availableSymbols || []}
                            initialEditorSymbols={initialEditorSymbols.current}
                            editorMode={editorMode}
                            logicSyntax={editorSyntax}
                        />}
                    </div>
                </Col>
            </Row>
            {currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex && <Row>
                <Col md={{size: 8, offset: 2}} className="py-4 inequality-results">
                    <h4>LaTeX</h4>
                    <pre>${currentAttemptValue?.result?.tex}$</pre>
                    {["chemistry", "nuclear"].includes(editorMode) && <>
                        <h4>MhChem</h4>
                        <pre>{currentAttemptValue?.result?.mhchem}</pre>
                    </>}
                    {!["chemistry", "nuclear"].includes(editorMode) && <>
                        <h4>Python</h4>
                        <pre>{currentAttemptValue?.result?.python}</pre>
                        <h4>MathML</h4>
                        <pre>{currentAttemptValue?.result?.mathml}</pre>
                    </>}
                    <h4>Available symbols</h4>
                    <pre>{currentAttemptValue?.result?.uniqueSymbols}</pre>
                    {(segueEnvironment === "DEV" || isStaff(user)) && <>
                        <h4>Inequality seed</h4>
                        <pre>{currentAttemptValue.symbols && JSON.stringify(currentAttemptValue.symbols)}</pre>
                    </>}
                </Col>
            </Row>}
        </Container>
    </div>;
};
export default Equality;
