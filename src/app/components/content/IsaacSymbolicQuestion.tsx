import React, {
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
    initialiseInequality,
    jsonHelper,
    parsePseudoSymbolicAvailableSymbols,
    sanitiseInequalityState,
    useCurrentQuestionAttempt,
    useModalWithScroll
} from "../../services";
import { Inequality, WidgetSpec } from "inequality";
import _flattenDeep from 'lodash/flatMapDeep';
import {v4 as uuid_v4} from "uuid";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import classNames from "classnames";
import { Loading } from "../handlers/IsaacSpinner";
import { InequalityState, SeedExpressions, SymbolicTextInput } from "../elements/inputs/SymbolicTextInput";

const InequalityModal = lazy(() => import("../elements/modals/inequality/InequalityModal"));

const IsaacSymbolicQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacSymbolicQuestionDTO>) => {
    const {currentAttempt, dispatchSetCurrentAttempt} = useCurrentQuestionAttempt<FormulaDTO>(questionId);
    const currentAttemptValue: InequalityState | undefined = currentAttempt?.value ? jsonHelper.parseOrDefault(currentAttempt.value, {result: {tex: '\\textrm{PLACEHOLDER HERE}'}}) : undefined;
    
    const initialSeed: SeedExpressions = useMemo(() => jsonHelper.parseOrDefault(doc.formulaSeed, undefined)?.[0]?.expression ?? '', [doc.formulaSeed]);  
    const previewText = (currentAttemptValue && currentAttemptValue.result) ? currentAttemptValue.result.tex : initialSeed.latex;
    const [textInput, setTextInput] = useState((currentAttemptValue ? currentAttemptValue.result?.python : initialSeed.python) ?? "");  

    const [hasStartedEditing, setHasStartedEditing] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const emptySubmission = !hasStartedEditing && !currentAttemptValue;
    const {openModal, closeModalAndReturnToScrollPosition} = useModalWithScroll({setModalVisible});

    const editorSeed: WidgetSpec[] = useRef(jsonHelper.parseOrDefault(doc.formulaSeed, undefined)).current;
    const initialEditorSymbols = useRef(editorSeed ?? []);
    const symbolList = parsePseudoSymbolicAvailableSymbols(doc.availableSymbols)?.map(str => str.trim().replace(/;/g, ',') ).sort().join(", ");
    
    const helpTooltipId = useMemo(() => `eqn-editor-help-${uuid_v4()}`, []);  
    const hiddenEditorRef = useRef<HTMLDivElement | null>(null);
    const sketchRef = useRef<Inequality | null | undefined>();
    
    const editorMode = "maths";

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
        // Only update the text-entry box if the graphical editor is visible
        const pythonExpression = (currentAttemptValue?.result && currentAttemptValue?.result.python) || "";
        if (modalVisible) {
            setTextInput(pythonExpression);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAttempt]);

    useLayoutEffect(() => {
        if (readonly) return; // as the ref won't be defined
        
        initialiseInequality("maths", hiddenEditorRef, sketchRef, currentAttemptValue, updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiddenEditorRef.current]);

    const openInequality = () => {
        if (!readonly) {
            openModal();
        }
    };

    return <div className="symbolic-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        {!readonly && <SymbolicTextInput editorMode={editorMode} hiddenEditorRef={hiddenEditorRef}
            textInput={textInput} setTextInput={setTextInput} setHasStartedEditing={setHasStartedEditing}
            initialSeedText={initialSeed.python} editorSeed={editorSeed} initialEditorSymbols={initialEditorSymbols} symbolList={symbolList}
            dispatchSetCurrentAttempt={dispatchSetCurrentAttempt} sketchRef={sketchRef} emptySubmission={emptySubmission} helpTooltipId={helpTooltipId}
        />}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
            role={readonly ? undefined : "button"} className={classNames("eqn-editor-preview rounded mt-2", {"empty": !previewText, "text-body-tertiary": previewText && emptySubmission})}
            onClick={openInequality} onKeyDown={ifKeyIsEnter(openInequality)}
            dangerouslySetInnerHTML={{ __html: previewText ? katex.renderToString(previewText) : '<span>or click here to drag and drop your answer</span>' }}
        />
        {/* TODO Accessibility */}
        {modalVisible && <Suspense fallback={<Loading/>}>
            <InequalityModal
                editorMode="maths" initialEditorSymbols={initialEditorSymbols.current}
                availableSymbols={doc.availableSymbols} editorSeed={editorSeed} questionDoc={doc}
                onEditorStateChange={updateState} close={closeModalAndReturnToScrollPosition}
            />
        </Suspense>}
    </div>;
};
export default IsaacSymbolicQuestion;
