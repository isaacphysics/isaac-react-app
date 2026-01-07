import React, {
    ChangeEvent,
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {FormulaDTO, IsaacSymbolicQuestionDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    isDefined,
    jsonHelper,
    parsePseudoSymbolicAvailableSymbols,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt
} from "../../services";
import {Inequality, makeInequality} from "inequality";
import {parseMathsExpression, ParsingError} from "inequality-grammar";
import _flattenDeep from 'lodash/flatMapDeep';
import {v4 as uuid_v4} from "uuid";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import {Button, Input, InputGroup, UncontrolledTooltip} from "reactstrap";

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

export const symbolicInputValidator = (input: string) => {
    const openBracketsCount = input.split('(').length - 1;
    const closeBracketsCount = input.split(')').length - 1;
    const regexStr = "[^ 0-9A-Za-zΑ-ΡΣ-Ωα-ω()*+,-./<=>^_±²³¼½¾×÷=]+"; // not \Alpha-\Omega directly because there is a gap in the unicode range (U+03A2)
    const badCharacters = new RegExp(regexStr);
    const errors = [];
    if (/\\[a-zA-Z()]|[{}]/.test(input)) {
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
    if (/[<>=].+[<>=]/.test(input)) {
        errors.push('We are not able to accept double inequalities, and answers will never require them.');
    }
    const invTrig = input.match(/(((sin|cos|tan|sec|cosec|cot)(h?))(\^|\*\*)[({]?-1[)}]?)/);
    if (invTrig != null) {
        const trigFunction = invTrig[2];
        if(invTrig[4] === 'h') {
            errors.push("To create the inverse " + trigFunction + " function, use 'ar" + trigFunction +"'.");
        }
        else {
            errors.push("To create the inverse " + trigFunction + " function, use 'arc" + trigFunction +"'.");
        }
    }
    if (/[A-Zbd-z](sin|cos|tan|log|ln|sqrt)\(/.test(input)) {
        // A warning about a common mistake naive users may make (no warning for asin or arcsin though):
        return ["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"];
    }
    return errors;
};

const IsaacSymbolicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<FormulaDTO>(questionId);

    const [modalVisible, setModalVisible] = useState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const [textInput, setTextInput] = useState('');

    let currentAttemptValue: any | undefined = undefined;

    function currentAttemptPythonExpression(): string {
        return (currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python) || "";
    }

    const [inputState, setInputState] = useState(() => ({pythonExpression: currentAttemptPythonExpression(), userInput: '', valid: true}));
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        if (state.userInput !== "" || modalVisible) {
            // Only call dispatch if the user has inputted text or is interacting with the modal
            // Otherwise this causes the response to reset on reload removing the banner
            dispatchSetCurrentAttempt({type: 'formula', value: JSON.stringify(newState), pythonExpression});
        }
        initialEditorSymbols.current = state.symbols;
    };

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible OR if this is the first load
        const pythonExpression = currentAttemptPythonExpression();
        if (modalVisible || textInput === '') {
            setTextInput(pythonExpression);
        }
        if (inputState.pythonExpression !== pythonExpression) {
            setInputState({...inputState, userInput: textInput, pythonExpression});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    const closeModalAndReturnToScrollPosition = useCallback(function(previousYPosition: number) {
        return function() {
            document.body.style.overflow = "initial";
            setModalVisible(false);
            if (isDefined(previousYPosition)) {
                window.scrollTo(0, previousYPosition);
            }
        };
    }(window.scrollY), [modalVisible]);

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined

        if (!isDefined(hiddenEditorRef.current)) {
            throw new Error("Unable to initialise inequality; target element not found.");
        }

        const {sketch, p} = makeInequality(
            hiddenEditorRef.current,
            100,
            0,
            _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
            {
                editorMode: "maths",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setTextInput(input);
        setInputState({...inputState, pythonExpression: input, userInput: textInput});

        const parsedExpression = parseMathsExpression(input);
        if (!isError(parsedExpression) && !(parsedExpression.length === 0 && input !== '')) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                dispatchSetCurrentAttempt({ type: 'formula', value: JSON.stringify(sanitiseInequalityState(state)), pythonExpression: ""});
                initialEditorSymbols.current = [];
            } else if (parsedExpression.length === 1) {
                // This and the next one are using input instead of textInput because React will update the state whenever it sees fit
                // so textInput will almost certainly be out of sync with input which is the current content of the text box.
                sketchRef.current?.parseSubtreeObject(parsedExpression[0], true, true, input);
            } else {
                const sizes = parsedExpression.map(countChildren);
                const i = sizes.indexOf(Math.max.apply(null, sizes));
                sketchRef.current?.parseSubtreeObject(parsedExpression[i], true, true, input);
            }
        }
    };

    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);
    const symbolList = parsePseudoSymbolicAvailableSymbols(doc.availableSymbols)?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    return (
        <div className="symbolic-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            {/* TODO Accessibility */}
            {modalVisible && <Suspense fallback={<div>Loading...</div>}>
                <InequalityModal
                    close={closeModalAndReturnToScrollPosition}
                    onEditorStateChange={updateState}
                    availableSymbols={doc.availableSymbols}
                    initialEditorSymbols={initialEditorSymbols.current}
                    editorSeed={editorSeed}
                    editorMode="maths"
                    questionDoc={doc}
                />
            </Suspense>}
            {!readonly && <div className="eqn-editor-input">
                <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
                <InputGroup className="my-2 separate-input-group">
                    <Input type="text" onChange={updateEquation} value={textInput}
                        placeholder="Type your formula here"/>
                    <>
                        {siteSpecific(
                            <Button type="button" className="eqn-editor-help" id={helpTooltipId} tag="a" href="/solving_problems#symbolic_text">?</Button>,
                            <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                        )}
                        <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                            Here are some examples of expressions you can type:<br />
                            <br />
                            a*x^2 + b x + c<br />
                            (-b ± sqrt(b**2 - 4ac)) / (2a)<br />
                            1/2 mv**2<br />
                            log(x_a, 2) == log(x_a) / log(2)<br />
                            <br />
                            As you type, the box below will preview the result.
                        </UncontrolledTooltip>
                    </>
                </InputGroup>
                <QuestionInputValidation userInput={textInput} validator={symbolicInputValidator} />
                {symbolList && <div className="eqn-editor-symbols">
                    The following symbols may be useful: <pre>{symbolList}</pre>
                </div>}
            </div>}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
                role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
                onClick={() => !readonly && setModalVisible(true)} onKeyDown={ifKeyIsEnter(() => !readonly && setModalVisible(true))}
                dangerouslySetInnerHTML={{ __html: !inputState.valid ? "<small>or click to replace your typed answer</small>" :
                    previewText ? katex.renderToString(previewText) : '<small>or click here to drag and drop your answer</small>' }}
            />
        </div>
    );
};
export default IsaacSymbolicQuestion;
