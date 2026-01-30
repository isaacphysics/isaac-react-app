import React, {
    ChangeEvent,
    lazy,
    Suspense,
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
import {parseBooleanExpression, parseInequalityChemistryExpression, parseInequalityNuclearExpression, parseMathsExpression, ParsingError} from "inequality-grammar";
import _flattenDeep from 'lodash/flatMapDeep';
import {v4 as uuid_v4} from "uuid";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import {Button, Input, InputGroup, UncontrolledTooltip} from "reactstrap";
import { EditorMode } from "../elements/modals/inequality/constants";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

// Magic starts here
interface ChildrenMap {
    children: {[key: string]: ChildrenMap};
}

export function countChildren(root: ChildrenMap) {
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

export function isError(p: ParsingError | any[]): p is ParsingError {
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
        if (invTrig[4] === 'h') {
            errors.push("To create the inverse " + trigFunction + " function, use 'ar" + trigFunction + "'.");
        }
        else {
            errors.push("To create the inverse " + trigFunction + " function, use 'arc" + trigFunction + "'.");
        }
    }
    if (/[A-Zbd-z](sin|cos|tan|log|ln|sqrt)\(/.test(input)) {
        // A warning about a common mistake naive users may make (no warning for asin or arcsin though):
        return ["Make sure to use spaces or * signs before function names like 'sin' or 'sqrt'!"];
    }
    return errors;
};

// The parser retuns a complex structure that isn't fully typed, but we still want to label its use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InequalitySymbol = any;

export type InequalityState = {
    result?: {
        tex?: string;
        python?: string;
        mathml?: string;
        mhchem?: string;
        uniqueSymbols?: string;
    };
    symbols?: InequalitySymbol[];
    textEntry?: boolean;
    userInput?: string;
};

function currentAttemptPythonExpression(state?: InequalityState): string {
    return (state && state.result && state.result.python) || "";
}

export function useModalWithScroll({setModalVisible}: { setModalVisible: (v: boolean) => void; }) {
    const scrollYRef = useRef<number>(0);

    const openModal = () => {
        scrollYRef.current = window.scrollY;
        setModalVisible(true);
    };

    const closeModalAndReturnToScrollPosition = () => {
        document.body.style.overflow = "initial";
        setModalVisible(false);
        window.scrollTo(0, scrollYRef.current);
    };

    return {
        openModal,
        closeModalAndReturnToScrollPosition,
    };
};

export const initialiseInequality = (editorMode: string, hiddenEditorRef: React.MutableRefObject<HTMLDivElement | null>, sketchRef: React.MutableRefObject<Inequality | null | undefined>, currentAttemptValue: InequalityState | undefined, updateState: (state: InequalityState) => void) => {
    if (!isDefined(hiddenEditorRef.current)) {
        throw new Error("Unable to initialise inequality; target element not found.");
    }

    const {sketch, p} = makeInequality(
        hiddenEditorRef.current,
        100,
        0,
        _flattenDeep((currentAttemptValue || { symbols: [] }).symbols),
        {
            editorMode,
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
    sketch.editorMode = editorMode;

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
};

export interface InputState {
    pythonExpression?: string;
    mhchemExpression?: string;
    userInput: string;
    valid: boolean;
}

interface SymbolicTextInputProps {
    editorMode: EditorMode;
    inputState: InputState;
    setInputState: React.Dispatch<React.SetStateAction<InputState>>;
    textInput: string;
    setTextInput: React.Dispatch<React.SetStateAction<string>>;
    initialEditorSymbols: React.MutableRefObject<InequalitySymbol[]>;
    dispatchSetCurrentAttempt: (attempt: {type: 'formula' | 'logicFormula' | 'chemicalFormula'; value: string; pythonExpression?: string; mhchemExpression?: string}) => void;
    sketchRef: React.MutableRefObject<Inequality | null | undefined>;
}

export const SymbolicTextInput = ({editorMode, inputState, setInputState, textInput, setTextInput, initialEditorSymbols, dispatchSetCurrentAttempt, sketchRef}: SymbolicTextInputProps) => {
    const updateEquation = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setTextInput(input);
        setInputState({...inputState, userInput: input, ...(["maths", "logic"].includes(editorMode) ? {pythonExpression: input} : {mhchemExpression: input})});

        const parsedExpression = editorMode === "maths"
            ? parseMathsExpression(input) 
            : editorMode === "chemistry"
                ? parseInequalityChemistryExpression(input)
                : editorMode === "nuclear"
                    ? parseInequalityNuclearExpression(input)
                    : parseBooleanExpression(input);

        if (!isError(parsedExpression) && !(parsedExpression.length === 0 && input !== '')) {
            if (input === '') {
                const state = {result: {tex: "", python: "", mathml: ""}};
                dispatchSetCurrentAttempt({ 
                    type: editorMode === "maths" ? 'formula' : editorMode === "logic" ? "logicFormula" : "chemicalFormula", 
                    value: JSON.stringify(sanitiseInequalityState(state)), 
                    ...(["maths", "logic"].includes(editorMode) ? {pythonExpression: ""} : {mhchemExpression: ""})});
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

    return <Input type="text" onChange={updateEquation} value={textInput} placeholder="Type your formula here"/>;
};

export const TooltipContents = ({editorMode}: {editorMode: EditorMode}) => {
    const example: React.ReactNode = 
        editorMode === "maths" ? <> a*x^2 + b x + c <br/> (-b ± sqrt(b**2 - 4ac)) / (2a) <br/> 1/2 mv**2 <br/> log(x_a, 2) == log(x_a) / log(2) <br/> </>
            : editorMode === "chemistry" ? <> H2O <br/> 2 H2 + O2 -&gt; 2 H2O <br/> CH3(CH2)3CH3 <br/> {"NaCl(aq) -> Na^{+}(aq) +  Cl^{-}(aq)"} <br/> </>
                : editorMode === "nuclear" ? <>  {"^{238}_{92}U -> ^{4}_{2}\\alphaparticle + _{90}^{234}Th"} <br/> {"^{0}_{-1}e"} <br/> {"\\gammaray"} <br/> </>
                    : <> A and (B or not C) <br/> A &amp; (B | !C) <br/> True &amp; ~(False + Q) <br/> 1 . ~(0 + Q) <br/></>;

    return <>
        Here are some examples of expressions you can type:<br />
        <br />
        {example}
        <br />
        As you type, the box below will preview the result.
    </>;
};

const IsaacSymbolicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicQuestionDTO>) => {
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<FormulaDTO>(questionId);
    const currentAttemptValue: InequalityState | undefined = (currentAttempt && currentAttempt.value)
        ? jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}}) 
        : undefined;
    const [inputState, setInputState] = useState<InputState>(() => ({pythonExpression: currentAttemptPythonExpression(currentAttemptValue), userInput: '', valid: true}));
    const [textInput, setTextInput] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const editorSeed: InequalitySymbol[] = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    const updateState = (state: InequalityState) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        if (state.userInput !== "" || modalVisible) {
            // Only call dispatch if the user has inputted text or is interacting with the modal
            // Otherwise this causes the response to reset on reload removing the banner
            dispatchSetCurrentAttempt({type: 'formula', value: JSON.stringify(newState), pythonExpression});
        }
        initialEditorSymbols.current = state.symbols ?? [];
    };

    useEffect(() => {
        // Only update the text-entry box if the graphical editor is visible OR if this is the first load
        const pythonExpression = currentAttemptPythonExpression(currentAttemptValue);
        if (modalVisible || textInput === '') {
            setTextInput(pythonExpression);
        }
        if (inputState.pythonExpression !== pythonExpression) {
            setInputState({...inputState, userInput: textInput, pythonExpression});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined
        
        initialiseInequality("maths", hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);
    const symbolList = parsePseudoSymbolicAvailableSymbols(doc.availableSymbols)?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    return <div className="symbolic-question">
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
                <SymbolicTextInput
                    editorMode="maths" inputState={inputState} setInputState={setInputState}
                    textInput={textInput} setTextInput={setTextInput} initialEditorSymbols={initialEditorSymbols}
                    dispatchSetCurrentAttempt={dispatchSetCurrentAttempt} sketchRef={sketchRef}
                />
                <>
                    {siteSpecific(
                        <Button type="button" className="eqn-editor-help" id={helpTooltipId} tag="a" href="/solving_problems#symbolic_text">?</Button>,
                        <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                    )}
                    <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                        <TooltipContents editorMode="maths"/>
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
            role={readonly ? undefined : "button"} className={classNames("eqn-editor-preview rounded", {"empty": !previewText})} tabIndex={readonly ? undefined : 0}
            onClick={() => !readonly && openModal()} onKeyDown={ifKeyIsEnter(() => !readonly && openModal())}
            dangerouslySetInnerHTML={{ __html: !inputState.valid ? "<small>or click to replace your typed answer</small>" :
                previewText ? katex.renderToString(previewText) : '<small>or click here to drag and drop your answer</small>' }}
        />
    </div>;
    
};
export default IsaacSymbolicQuestion;
