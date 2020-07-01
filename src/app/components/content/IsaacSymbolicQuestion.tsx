import React, {ChangeEvent, useEffect, useLayoutEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {FormulaDTO, IsaacSymbolicQuestionDTO} from "../../../IsaacApiTypes";
import {InequalityModal} from "../elements/modals/InequalityModal";
import katex from "katex";
import {ifKeyIsEnter} from "../../services/navigation";
import {selectors} from "../../state/selectors";
import {Inequality, makeInequality} from "inequality";
import {parseExpression} from "inequality-grammar";

import _flattenDeep from 'lodash/flatMapDeep';
import {parsePseudoSymbolicAvailableSymbols, selectQuestionPart, sanitiseInequalityState} from "../../services/questions";

// Magic starts here
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

function isError(p: {error: string} | any[]): p is {error: string} {
    return p.hasOwnProperty("error");
}

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    let r: {currentAttempt?: FormulaDTO | null} = {};
    if (questionPart) {
        r.currentAttempt = questionPart.currentAttempt;
    }
    return r;
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicQuestionProps {
    doc: IsaacSymbolicQuestionDTO;
    questionId: string;
    currentAttempt?: FormulaDTO | null;
    setCurrentAttempt: (questionId: string, attempt: FormulaDTO) => void;
}
const IsaacSymbolicQuestionComponent = (props: IsaacSymbolicQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const [initialEditorSymbols, setInitialEditorSymbols] = useState(JSON.parse(doc.formulaSeed || '[]'));
    const [textInput, setTextInput] = useState('');

    let currentAttemptValue: any | undefined;
    if (currentAttempt && currentAttempt.value) {
        try {
            currentAttemptValue = JSON.parse(currentAttempt.value);
        } catch(e) {
            currentAttemptValue = { result: { tex: '\\textrm{PLACEHOLDER HERE}' } };
        }
    }

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        const previousPythonExpression = currentAttemptValue?.result?.python || "";
        if (!previousPythonExpression || previousPythonExpression !== pythonExpression) {
            setCurrentAttempt(questionId, {type: 'formula', value: JSON.stringify(newState), pythonExpression});
        }
        setInitialEditorSymbols(state.symbols);
    };

    const closeModal = (previousYPosition: number) => () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
        window.scrollTo(0, previousYPosition);
    };

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    function currentAttemptPythonExpression(): string {
        return currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python || "";
    }

    const [inputState, setInputState] = useState(() => ({pythonExpression: currentAttemptPythonExpression(), userInput: '', valid: true}));
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

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality>();

    useLayoutEffect(() => {
        const {sketch} = makeInequality(
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
        sketch.log = { initialState: [], actions: [] };
        sketch.onNewEditorState = updateState;
        sketch.onCloseMenus = () => {};
        sketch.isUserPrivileged = () => { return true; };
        sketch.onNotifySymbolDrag = () => {};
        sketch.isTrashActive = () => { return false; };

        sketchRef.current = sketch;
    }, [hiddenEditorRef.current]);

    let [errors, setErrors] = useState<string[]>();

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
            let parsedExpression = parseExpression(pycode);

            if (isError(parsedExpression) || (parsedExpression.length === 0 && pycode !== '')) {
                let openBracketsCount = pycode.split('(').length - 1;
                let closeBracketsCount = pycode.split(')').length - 1;
                let regexStr = "[^ (-)*-/0-9<->A-Z^-_a-z±²-³¼-¾×÷]+";
                let badCharacters = new RegExp(regexStr);
                errors = [];
                if (/\\[a-zA-Z()]|[{}]/.test(pycode)) {
                    errors.push('LaTeX syntax is not supported.');
                }
                if (/\|.+?\|/.test(pycode)) {
                    errors.push('Vertical bar syntax for absolute value is not supported; use abs() instead.');
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
                    errors.push('Some of the characters you are using are not allowed: ' + usedBadChars.join(" "));
                }
                if (openBracketsCount !== closeBracketsCount) {
                    errors.push('You are missing some ' + (closeBracketsCount > openBracketsCount ? 'opening' : 'closing') + ' brackets.');
                }
                if (/\.[0-9]/.test(pycode)) {
                    errors.push('Please convert decimal numbers to fractions.');
                }
                setErrors(errors);
            } else {
                setErrors(undefined);
                if (pycode === '') {
                    const state = {result: {tex: "", python: "", mathml: ""}};
                    setCurrentAttempt(questionId, { type: 'formula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                    setInitialEditorSymbols([]);
                } else if (parsedExpression.length === 1) {
                    // This and the next one are using pycode instead of textInput because React will update the state whenever it sees fit
                    // so textInput will almost certainly be out of sync with pycode which is the current content of the text box.
                    sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[0], true, true, pycode);
                } else {
                    let sizes = parsedExpression.map(countChildren);
                    let i = sizes.indexOf(Math.max.apply(null, sizes));
                    sketchRef.current && sketchRef.current.parseSubtreeObject(parsedExpression[i], true, true, pycode);
                }
            }
        }, 250);
    };

    const helpTooltipId = `eqn-editor-help-${(doc.id || "").split('|').pop()}`;
    const symbolList = parsePseudoSymbolicAvailableSymbols(doc.availableSymbols)?.map(
        function (str) {return str.trim().replace(/;/g, ',')}).sort().join(", ");
    return (
        <div className="symbolic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            <div
                role="button" className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={0}
                onClick={() => setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => setModalVisible(true))}
                dangerouslySetInnerHTML={{ __html: !inputState.valid ? "Click to replace your typed answer" :
                    previewText ? katex.renderToString(previewText) : 'Click to enter your answer' }}
            />
            {modalVisible && <InequalityModal
                close={closeModal(window.scrollY)}
                onEditorStateChange={updateState}
                availableSymbols={doc.availableSymbols}
                initialEditorSymbols={initialEditorSymbols}
                visible={modalVisible}
                editorMode='maths'
            />}
            <div className="eqn-editor-input">
                <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                <RS.InputGroup className="my-2">
                    <RS.Input type="text" onChange={updateEquation} value={textInput}
                        placeholder="or type your formula here"/>
                    <RS.InputGroupAddon addonType="append">
                        <RS.Button type="button" className="eqn-editor-help" id={helpTooltipId}>?</RS.Button>
                        <RS.UncontrolledTooltip placement="bottom" autohide={false} target={helpTooltipId}>
                            Here are some examples of expressions you can type:<br />
                            <br />
                            a*x^2 + b x + c<br />
                            (-b ± sqrt(b**2 - 4ac)) / (2a)<br />
                            1/2 mv**2<br />
                            log(x_a, 2) == log(x_a) / log(2)<br />
                            <br />
                            As you type, the box above will preview the result.
                        </RS.UncontrolledTooltip>
                    </RS.InputGroupAddon>
                </RS.InputGroup>
                {errors && <div className="eqn-editor-input-errors"><strong>Careful!</strong><ul>
                    {errors.map(e => (<li key={e}>{e}</li>))}
                </ul></div>}
                {symbolList && <div className="eqn-editor-symbols">
                    The following symbols may be useful: <pre>{symbolList}</pre>
                </div>}
            </div>
        </div>
    );
};

export const IsaacSymbolicQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicQuestionComponent);
