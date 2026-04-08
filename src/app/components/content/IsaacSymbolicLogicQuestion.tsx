import React, {lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacSymbolicLogicQuestionDTO, LogicFormulaDTO} from "../../../IsaacApiTypes";
import katex from "katex";
import {
    ifKeyIsEnter,
    initialiseInequality,
    isDefined,
    jsonHelper,
    sanitiseInequalityState,
    useCurrentQuestionAttempt,
    useModalWithScroll,
    useUserPreferences
} from "../../services";
import _flattenDeep from 'lodash/flattenDeep';
import {v4 as uuid_v4} from "uuid";
import { Inequality, WidgetSpec } from 'inequality';
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import { Loading } from "../handlers/IsaacSpinner";
import { InequalityState, SeedExpressions, SymbolicTextInput } from "../elements/inputs/SymbolicTextInput";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const IsaacSymbolicLogicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicLogicQuestionDTO>) => {
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<LogicFormulaDTO>(questionId);
    const currentAttemptValue: InequalityState | undefined = currentAttempt?.value ? jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}}) : undefined;
    const questionAttemptLoaded = useRef(!!currentAttemptValue);

    const [hideSeed, setHideSeed] = useState(!!currentAttempt);
    const initialSeed: SeedExpressions = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined)?.[0]?.expression ?? '', [doc.formulaSeed]);  
    const previewText = (currentAttemptValue && currentAttemptValue.result)  
        ? currentAttemptValue.result.tex 
        : !hideSeed ? initialSeed.latex : undefined;  
    const [textInput, setTextInput] = useState((currentAttemptValue ? currentAttemptValue.result?.python : initialSeed.python) ?? "");
 
    const [hasStartedEditing, setHasStartedEditing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const emptySubmission = !hasStartedEditing && !currentAttemptValue;
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});
    
    const editorSeed: WidgetSpec[] = useRef(jsonHelper.parseOrDefault(doc.formulaSeed, undefined)).current;
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const symbolList = doc.availableSymbols?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");
    const {preferredBooleanNotation} = useUserPreferences();

    const helpTooltipId = CSS.escape(`eqn-editor-help-${uuid_v4()}`);
    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();

    const editorMode = "logic";

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
        // Only update the text-entry box if the graphical editor is visible OR if the question attempt is loaded for the first time
        const pythonExpression = currentAttemptValue?.result && currentAttemptValue?.result.python;
        if (isDefined(pythonExpression) && (modalVisible || !questionAttemptLoaded.current)) {
            questionAttemptLoaded.current = true;
            setTextInput(pythonExpression);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined
        
        initialiseInequality("logic", hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    useEffect(() => {
        if (!currentAttempt || !currentAttemptValue || !currentAttemptValue.symbols) return;

        initialEditorSymbols.current = _flattenDeep(currentAttemptValue.symbols);
    }, [currentAttempt, currentAttemptValue]);

    const openInequality = () => {
        if (!readonly) {
            openModal();
            setHideSeed(true);
        }
    };

    return <div className="symbolic-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {/* TODO Accessibility */}
        {modalVisible && <Suspense fallback={<Loading/>}>
            <InequalityModal
                editorMode="logic" logicSyntax={preferredBooleanNotation === "ENG" ? 'binary' : 'logic'}
                initialEditorSymbols={initialEditorSymbols.current} availableSymbols={doc.availableSymbols}
                editorSeed={editorSeed} questionDoc={doc} onEditorStateChange={updateState}
                close={closeModalAndReturnToScrollPosition}
            />
        </Suspense>}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
            role={readonly ? undefined : "button"} className={classNames("eqn-editor-preview rounded mt-2", {"empty": !previewText, "text-body-tertiary": previewText && emptySubmission})} tabIndex={readonly ? undefined : 0}
            onClick={openInequality} onKeyDown={ifKeyIsEnter(openInequality)}
            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : 'Click to enter your expression' }}
        />
        {!readonly && <SymbolicTextInput editorMode={editorMode} hiddenEditorRef={hiddenEditorRef}
            textInput={textInput} setTextInput={setTextInput} setHasStartedEditing={setHasStartedEditing}
            initialSeedText={initialSeed.python} editorSeed={editorSeed} initialEditorSymbols={initialEditorSymbols} symbolList={symbolList}
            dispatchSetCurrentAttempt={dispatchSetCurrentAttempt} sketchRef={sketchRef} emptySubmission={emptySubmission} helpTooltipId={helpTooltipId}
        />}
    </div>;
};
export default IsaacSymbolicLogicQuestion;
