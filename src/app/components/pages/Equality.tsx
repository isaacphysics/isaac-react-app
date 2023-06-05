import React, {ChangeEvent, lazy, useEffect, useLayoutEffect, useRef, useState} from "react";
import {withRouter} from "react-router-dom";
import {Button, Col, Container, Input, InputGroup, InputGroupAddon, Label, Row, UncontrolledTooltip} from "reactstrap";
import queryString from "query-string";
import {ifKeyIsEnter, isDefined, isStaff, siteSpecific, sanitiseInequalityState} from "../../services";
import katex from "katex";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RouteComponentProps} from "react-router";
import {Inequality, makeInequality} from 'inequality';
import {parseBooleanExpression, parseMathsExpression, ParsingError} from 'inequality-grammar';
import {isaacApi, selectors, useAppSelector} from "../../state";
import {EditorMode, LogicSyntax} from "../elements/modals/inequality/constants";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const Equality = withRouter(({location}: RouteComponentProps<{}, {}, {board?: string; mode?: string; symbols?: string}>) => {
    const queryParams = queryString.parse(location.search);

    const [modalVisible, setModalVisible] = useState(false);
    const initialEditorSymbols = useRef<string[]>([]);
    const [currentAttempt, setCurrentAttempt] = useState<any>({type: 'formula', value: {}, pythonExpression: ''});
    const [editorSyntax, setEditorSyntax] = useState<LogicSyntax>('logic');
    const [textInput, setTextInput] = useState('');
    const [errors, setErrors] = useState<string[]>();
    const user = useAppSelector(selectors.user.orNull);
    // Does this really need to be a state variable if it is immutable?
    const [editorMode, setEditorMode] = useState<EditorMode>((queryParams.mode as EditorMode) || siteSpecific('maths', 'logic'));
    const {data: segueEnvironment} = isaacApi.endpoints.getSegueEnvironment.useQuery();

    /*** Text based input stuff */
    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality|null|undefined>();
    const debounceTimer = useRef<number|null>(null);
    const [inputState, setInputState] = useState(() => ({pythonExpression: '', userInput: '', valid: true}));

    function isError(p: ParsingError | any[]): p is ParsingError {
        return p.hasOwnProperty("error");
    }

    interface ChildrenMap {
        children: {[key: string]: ChildrenMap};
    }

    function countChildren(root: ChildrenMap) {
        let q = [root];
        let count = 1;
        while (q.length > 0) {
            let e = q.shift();
            if (!e) continue;

            let c = Object.keys(e.children).length;
            if (c > 0) {
                count = count + c;
                q = q.concat(Object.values(e.children));
            }
        }
        return count;
    }

    function updateState(state: any) {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        const previousPythonExpression = currentAttempt.value?.result?.python || "";
        if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
            setCurrentAttempt({type: 'formula', value: JSON.stringify(newState), pythonExpression});
        }
        initialEditorSymbols.current = state.symbols;
    }

    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        _updateEquation(e.target.value);
    }

    const _updateEquation = (pycode: string) => {
        // const pycode = e.target.value;
        setTextInput(pycode);
        setInputState({...inputState, pythonExpression: pycode, userInput: textInput});

        // Parse that thing
        if (debounceTimer.current) {
            window.clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        debounceTimer.current = window.setTimeout(() => {
            let parsedExpression: any[] | ParsingError | undefined;
            if (editorMode === 'maths') {
                parsedExpression = parseMathsExpression(pycode);
            } else if (editorMode === 'logic') {
                parsedExpression = parseBooleanExpression(pycode);
            }
            const _errors = [];

            if (isDefined(parsedExpression) && (isError(parsedExpression) || (parsedExpression.length === 0 && pycode !== ''))) {
                const openBracketsCount = pycode.split('(').length - 1;
                const closeBracketsCount = pycode.split(')').length - 1;
                let regexStr = '';
                if (editorMode === 'maths') {
                    regexStr = "[^ 0-9A-Za-z()*+,-./<=>^_±²³¼½¾×÷=]+";
                } else {
                    regexStr = "[^ A-Za-z&|01()~¬∧∨⊻+.!=]+"
                }
                const badCharacters = new RegExp(regexStr);
                setErrors([]);

                if (isError(parsedExpression) && parsedExpression.error) {
                    _errors.push(`Syntax error: unexpected token "${parsedExpression.error.token.value || ''}"`)
                }
                if (/\\[a-zA-Z()]|[{}]/.test(pycode)) {
                    _errors.push('LaTeX syntax is not supported.');
                }
                if (/\|.+?\|/.test(pycode)) {
                    _errors.push('Vertical bar syntax for absolute value is not supported; use abs() instead.');
                }
                if (badCharacters.test(pycode)) {
                    const usedBadChars: string[] = [];
                    for(let i = 0; i < pycode.length; i++) {
                        const char = pycode.charAt(i);
                        if (badCharacters.test(char)) {
                            if (!usedBadChars.includes(char)) {
                                usedBadChars.push(char);
                            }
                        }
                    }
                    _errors.push('Some of the characters you are using are not allowed: ' + usedBadChars.join(" "));
                }
                if (openBracketsCount !== closeBracketsCount) {
                    _errors.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
                }
                if (/\.[0-9]/.test(pycode)) {
                    _errors.push('Please convert decimal numbers to fractions.');
                }
                setErrors(_errors);
            } else {
                setErrors(undefined);
                if (pycode === '') {
                    const state = {result: {tex: "", python: "", mathml: ""}};
                    setCurrentAttempt({ type: 'formula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                    initialEditorSymbols.current = [];
                } else if (isDefined(parsedExpression) && parsedExpression.length === 1) {
                    // This and the next one are using pycode instead of textInput because React will update the state whenever it sees fit
                    // so textInput will almost certainly be out of sync with pycode which is the current content of the text box.
                    if (sketchRef.current) {
                        sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, pycode);
                    }
                } else if (isDefined(parsedExpression)) {
                    if (sketchRef.current) {
                        const sizes = parsedExpression.map(countChildren);
                        const i = sizes.indexOf(Math.max.apply(null, sizes));
                        sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, pycode);
                    }
                }
            }
        }, 250);
    };

    useEffect(() => {
        if (sketchRef.current) {
            sketchRef.current.logicSyntax = editorSyntax;
        }
    }, [editorSyntax]);

    useLayoutEffect(() => {
        const {sketch} = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            [],
            {
                textEntry: true,
                fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf',
            }
        );
        if (!isDefined(sketch)) throw new Error("Unable to initialize Inequality.");

        sketch.log = { initialState: [], actions: [] };
        sketch.onNewEditorState = updateState;
        sketch.onCloseMenus = () => { void 0 };
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = () => { void 0 };
        sketch.isTrashActive = () => { return false; };

        sketchRef.current = sketch;
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

    return <div>
        <Container>
            <Row>
                <Col>
                    <TitleAndBreadcrumb currentPageTitle="Equation editor demo page" />
                </Col>
            </Row>
            <Row>
                <Col md={{size: 2}} className="py-4 syntax-picker mode-picker">
                    <div>
                        <Label for="inequality-mode-select">Editor mode:</Label>
                        <Input type="select" name="mode" id="inequality-mode-select" value={editorMode as string} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditorMode(e.target.value as EditorMode)}>
                            <option value="maths">Maths</option>
                            <option value="chemistry">Chemistry</option>
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
                <Col md={{size: 8}} className="py-4 question-panel">
                    {(editorMode === 'maths' || (isStaff(user) && editorMode === 'logic')) && <div className="eqn-editor-input mt-4">
                        <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                        <InputGroup className="my-2">
                            <Input className="py-4" type="text" onChange={updateEquation} value={textInput}
                                placeholder="Type your expression here"/>
                            <InputGroupAddon addonType="append">
                                {siteSpecific(
                                    <Button type="button" className="eqn-editor-help pt-2" id="inequality-help" size="sm" tag="a" href="/solving_problems#symbolic_text">?</Button>,
                                    <span id={"inequality-help"} className="icon-help-q my-auto"/>
                                )}
                                {editorMode === 'maths' && <UncontrolledTooltip placement="top" autohide={false} target='inequality-help'>
                                    Here are some examples of expressions you can type:<br />
                                    <br />
                                    a*x^2 + b x + c<br />
                                    (-b ± sqrt(b**2 - 4ac)) / (2a)<br />
                                    1/2 mv**2<br />
                                    log(x_a, 2) == log(x_a) / log(2)<br />
                                    <br />
                                    As you type, the box below will preview the result.
                                </UncontrolledTooltip>}
                                {editorMode === 'logic' && <UncontrolledTooltip placement="top" autohide={false} target='inequality-help'>
                                    Here are some examples of expressions you can type:<br />
                                    <br />
                                    A AND (B XOR NOT C)<br />
                                    A &amp; (B ^ !C)<br />
                                    T &amp; ~(F + A)<br />
                                    1 . ~(0 + A)<br />
                                    As you type, the box below will preview the result.
                                </UncontrolledTooltip>}
                            </InputGroupAddon>
                        </InputGroup>
                        {isDefined(errors) && Array.isArray(errors) && errors.length > 0 && <div className="eqn-editor-input-errors"><strong>Careful!</strong><ul>
                            {errors.map(e => (<li key={e}>{e}</li>))}
                        </ul></div>}
                    </div>}
                    <div className="equality-page">
                        <div
                            role="button" className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''} ${editorMode !== 'maths' ? 'mt-4' : ''}`} tabIndex={0}
                            onClick={() => setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => setModalVisible(true))}
                            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : `<small>${editorMode === 'maths' ? 'or c' : 'C'}lick here to enter a formula</small>` }}
                        />
                        {modalVisible && <InequalityModal
                            close={closeModal}
                            onEditorStateChange={(state: any) => {
                                setCurrentAttempt({
                                    type: 'logicFormula',
                                    value: JSON.stringify(state),
                                    pythonExpression: (state && state.result && state.result.python)||"",
                                    symbols: [],
                                })
                                setTextInput(state?.result?.python || '');
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
                    {editorMode === 'chemistry' && <>
                        <h4>MhChem</h4>
                        <pre>{currentAttemptValue?.result?.mhchem}</pre>
                    </>}
                    {editorMode !== 'chemistry' && <>
                        <h4>Python</h4>
                        <pre>{currentAttemptValue?.result?.python}</pre>
                        <h4>MathML</h4>
                        <pre>{currentAttemptValue?.result?.mathml}</pre>
                    </>}
                    <h4>Available symbols</h4>
                    <pre>{currentAttemptValue?.result?.uniqueSymbols}</pre>
                    {(segueEnvironment === "DEV" || isStaff(user)) && <>
                        <h4>Inequality seed</h4>
                        <pre>{currentAttemptValue && currentAttemptValue.symbols && JSON.stringify(currentAttemptValue.symbols)}</pre>
                    </>}
                </Col>
            </Row>}
        </Container>
    </div>;
});
export default Equality;
