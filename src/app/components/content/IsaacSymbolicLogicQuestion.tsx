import React, {lazy, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacSymbolicLogicQuestionDTO, LogicFormulaDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    jsonHelper,
    sanitiseInequalityState,
    siteSpecific,
    useCurrentQuestionAttempt,
    useUserPreferences
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {Button, InputGroup, UncontrolledTooltip} from 'reactstrap';
import {v4 as uuid_v4} from "uuid";
import {Inequality} from 'inequality';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import QuestionInputValidation from "../elements/inputs/QuestionInputValidation";
import { initialiseInequality, InputState, SymbolicTextInput, TooltipContents, useModalWithScroll } from "./IsaacSymbolicQuestion";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

// TODO: Create a more modular version of this to use across files
export const symbolicLogicInputValidator = (input: string) => {
    const openBracketsCount = input.split('(').length - 1;
    const closeBracketsCount = input.split(')').length - 1;
    const regexStr = "[^ A-Za-z&|01()~¬∧∨^⊻+.!=]+";
    const badCharacters = new RegExp(regexStr);

    const errors = [];
    if (/\\[a-zA-Z()]|[{}]/.test(input)) {
        errors.push('LaTeX syntax is not supported.');
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
    return errors;
};

const IsaacSymbolicLogicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicLogicQuestionDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<LogicFormulaDTO>(questionId);
    const [modalVisible, setModalVisible] = useState(false);
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const editorSeed = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined), []);
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const [textInput, setTextInput] = useState('');
    const {preferredBooleanNotation} = useUserPreferences();

    let currentAttemptValue: any | undefined = undefined;

    function currentAttemptPythonExpression(): string {
        return (currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.python) || "";
    }

    const [inputState, setInputState] = useState<InputState>(() => ({pythonExpression: currentAttemptPythonExpression(), userInput: '', valid: true}));
    if (currentAttempt && currentAttempt.value) {
        currentAttemptValue = jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}});
    }

    const updateState = (state: any) => {
        const newState = sanitiseInequalityState(state);
        const pythonExpression = newState?.result?.python || "";
        dispatchSetCurrentAttempt({type: 'logicFormula', value: JSON.stringify(newState), pythonExpression});
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

    const previewText = currentAttemptValue && currentAttemptValue.result && currentAttemptValue.result.tex;

    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined
        
        initialiseInequality("logic", hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const helpTooltipId = CSS.escape(`eqn-editor-help-${uuid_v4()}`);
    const symbolList = doc.availableSymbols?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");

    return <div className="symbolic-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {/* TODO Accessibility */}
        {modalVisible && <InequalityModal
            close={closeModalAndReturnToScrollPosition}
            onEditorStateChange={updateState}
            availableSymbols={doc.availableSymbols}
            initialEditorSymbols={initialEditorSymbols.current}
            editorSeed={editorSeed}
            editorMode='logic'
            logicSyntax={preferredBooleanNotation === "ENG" ? 'binary' : 'logic'}
            questionDoc={doc}
        />}
        {!readonly && <div className="eqn-editor-input">
            <div ref={hiddenEditorRef} className="equation-editor-text-entry" style={{height: 0, overflow: "hidden", visibility: "hidden"}} />
            <InputGroup className="my-2 separate-input-group">
                <SymbolicTextInput
                    editorMode="logic" inputState={inputState} setInputState={setInputState}
                    textInput={textInput} setTextInput={setTextInput} initialEditorSymbols={initialEditorSymbols}
                    dispatchSetCurrentAttempt={dispatchSetCurrentAttempt} sketchRef={sketchRef}
                />
                <>
                    {siteSpecific(
                        <Button type="button" className="eqn-editor-help" id={helpTooltipId}>?</Button>,
                        <i id={helpTooltipId} className="icon icon-info icon-sm h-100 ms-3 align-self-center" />
                    )}
                    <UncontrolledTooltip placement="top" autohide={false} target={helpTooltipId}>
                        <TooltipContents editorMode="logic"/>
                    </UncontrolledTooltip>
                </>
            </InputGroup>
            <QuestionInputValidation userInput={textInput} validator={symbolicLogicInputValidator} />
            {symbolList && <div className="eqn-editor-symbols">
                The following symbols may be useful: <pre>{symbolList}</pre>
            </div>}
        </div>}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
            role={readonly ? undefined : "button"} className={`eqn-editor-preview rounded ${!previewText ? 'empty' : ''}`} tabIndex={readonly ? undefined : 0}
            onClick={() => !readonly && openModal()} onKeyDown={ifKeyIsEnter(() => !readonly && openModal())}
            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }}
        />
    </div>;
};
export default IsaacSymbolicLogicQuestion;
