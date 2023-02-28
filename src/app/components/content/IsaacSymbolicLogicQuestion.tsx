import React, {ChangeEvent, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {selectors, useAppSelector} from "../../state";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacSymbolicLogicQuestionDTO, LogicFormulaDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    isDefined,
    isStaff,
    jsonHelper,
    sanitiseInequalityState,
    useCurrentQuestionAttempt,
    useUserContext
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {Button, Input, InputGroup, InputGroupAddon, UncontrolledTooltip} from 'reactstrap';
import {v4 as uuid_v4} from "uuid";
import {Inequality, makeInequality} from 'inequality';
import {parseBooleanExpression, ParsingError} from 'inequality-grammar';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

// Magic starts here
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

function isError(p: ParsingError | any[]): p is ParsingError {
    return p.hasOwnProperty("error");
}

const IsaacSymbolicLogicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicLogicQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<LogicFormulaDTO>(questionId);

    const [modalVisible, setModalVisible] = useState(false);
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const {preferredBooleanNotation} = useUserContext();
    const [textInput, setTextInput] = useState('');
    const user = useAppSelector(selectors.user.orNull);

    function currentAttemptPythonExpression(): string {
        return (currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python) || "";
    }

    const [inputState, setInputState] = useState(() => ({pythonExpression: currentAttemptPythonExpression(), userInput: '', valid: true}));

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        const previousPythonExpression = currentAttemptValue?.result?.python || "";
        if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
            dispatchSetCurrentAttempt({type: 'logicFormula', value: JSON.stringify(newState), pythonExpression});
        }
        initialEditorSymbols.current = state.symbols;
    };

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible OR if this is the first load
        const pythonExpression = currentAttemptPythonExpression();
        if (modalVisible || textInput === '') {
            setTextInput(pythonExpression);
        }
        if (inputState.pythonExpression !== pythonExpression) {
            setInputState({...inputState, userInput: textInput, pythonExpression});
        }
    }, [currentAttempt]);

    const closeModal = (previousYPosition: number) => () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
        if (isDefined(previousYPosition)) {
            window.scrollTo(0, previousYPosition);
        }
    };

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality>();

    useLayoutEffect(() => {
        const { sketch } = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
            {
                textEntry: true,
                fontItalicPath: '/assets/fonts/STIXGeneral-Italic.ttf',
                fontRegularPath: '/assets/fonts/STIXGeneral-Regular.ttf',
            }
        );
        if (!isDefined(sketch)) throw new Error("Unable to initialize Inequality.");
        
        sketch.log = { initialState: [], actions: [] };
        sketch.onNewEditorState = updateState;
        sketch.onCloseMenus = () => undefined;
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = () => undefined;
        sketch.isTrashActive = () => { return false; };

        sketchRef.current = sketch;
    }, [hiddenEditorRef.current]);

    const [errors, setErrors] = useState<string[]>();

    const debounceTimer = useRef<number|null>(null);
    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        const pycode = e.target.value;
        setTextInput(pycode);
        setInputState({...inputState, pythonExpression: pycode, userInput: textInput});

        // Parse that thing
        if (debounceTimer.current) {
            window.clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        debounceTimer.current = window.setTimeout(() => {
            const parsedExpression = parseBooleanExpression(pycode);

            if (isError(parsedExpression) || (parsedExpression.length === 0 && pycode !== '')) {
                const openBracketsCount = pycode.split('(').length - 1;
                const closeBracketsCount = pycode.split(')').length - 1;
                const regexStr = "[^ A-Za-z&|01()~¬∧∨⊻+.!=]+"
                const badCharacters = new RegExp(regexStr);

                const _errors = [];
                if (/\\[a-zA-Z()]|[{}]/.test(pycode)) {
                    _errors.push('LaTeX syntax is not supported.');
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
                setErrors(_errors);
            } else {
                setErrors(undefined);
                if (pycode === '') {
                    const state = {result: {tex: "", python: "", mathml: ""}};
                    dispatchSetCurrentAttempt({ type: 'logicFormula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                    initialEditorSymbols.current = [];
                } else if (parsedExpression.length === 1) {
                    // This and the next one are using pycode instead of textInput because React will update the state whenever it sees fit
                    // so textInput will almost certainly be out of sync with pycode which is the current content of the text box.
                    sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, pycode);
                } else {
                    const sizes = parsedExpression.map(countChildren);
                    const i = sizes.indexOf(Math.max.apply(null, sizes));
                    sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, pycode);
                }
            }
        }, 250);
    };

    const helpTooltipId = CSS.escape(`eqn-editor-help-${uuid_v4()}`);
    const symbolList = doc.availableSymbols?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    return (
        <div className="symbolic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <div
                role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
                onClick={() => !readonly && setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => !readonly && setModalVisible(true))}
                dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }}
            />
            {modalVisible && <InequalityModal
                close={closeModal(window.scrollY)}
                onEditorStateChange={(state: any) => {
                    dispatchSetCurrentAttempt({ type: 'logicFormula', value: JSON.stringify(state), pythonExpression: (state && state.result && state.result.python)||"" })
                    initialEditorSymbols.current = state.symbols;
                }}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols.current}
                editorSeed={editorSeed}
                editorMode='logic'
                logicSyntax={preferredBooleanNotation === "ENG" ? 'binary' : 'logic'}
                questionDoc={doc}
            />}
            {!readonly && isStaff(user) && <div className="eqn-editor-input">
                <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                <InputGroup className="my-2">
                    <Input type="text" onChange={updateEquation} value={textInput}
                           placeholder="or type your expression here"/>
                    <InputGroupAddon addonType="append">
                        <Button type="button" className="eqn-editor-help" id={helpTooltipId}>?</Button>
                        <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                            Here are some examples of expressions you can type:<br />
                            <br />
                            A AND (B XOR NOT C)<br />
                            A &amp; (B ^ !C)<br />
                            T &amp; ~(F + A)<br />
                            1 . ~(0 + A)<br />
                            As you type, the box above will preview the result.
                        </UncontrolledTooltip>
                    </InputGroupAddon>
                </InputGroup>
                {isDefined(errors) && Array.isArray(errors) && errors.length > 0 && <div className="eqn-editor-input-errors"><strong>Careful!</strong><ul>
                    {errors.map(e => (<li key={e}>{e}</li>))}
                </ul></div>}
                {symbolList && <div className="eqn-editor-symbols">
                    The following symbols may be useful: <pre>{symbolList}</pre>
                </div>}
            </div>}
        </div>
    );
};
export default IsaacSymbolicLogicQuestion;