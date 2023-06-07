import React, {useState, useEffect, useRef} from "react";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import GraphSketcherModal from "../elements/modals/GraphSketcherModal";
import {GraphSketcher, makeGraphSketcher, LineType, GraphSketcherState} from "isaac-graph-sketcher";
import {isStaff, useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {selectors, useAppSelector} from "../../state";

const IsaacGraphSketcherQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacGraphSketcherQuestionDTO>) => {

    const user = useAppSelector(selectors.user.orNull);

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<GraphChoiceDTO>(questionId);

    const [modalVisible, setModalVisible] = useState(false);
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher | null>();
    // IMPORTANT - initial state will be defined on the first render if it exists, because currentAttempt is loaded in
    // with the question page data.
    // ! If this becomes no longer true ! then we will need a useEffect with [initialState] dependency to set the initial
    // state once the currentAttempt is loaded in.
    const initialState: GraphSketcherState | undefined = currentAttempt?.value ? JSON.parse(currentAttempt?.value) : undefined;
    const previewRef = useRef<HTMLDivElement>(null);

    // This is used to defer the updating of the current attempt until the user closes the modal.
    const [pendingAttemptState, setPendingAttemptState] = useState<GraphSketcherState | undefined>(initialState);

    function openModal() {
        !readonly && setModalVisible(true);
    }

    function closeModal() {
        dispatchSetCurrentAttempt({type: 'graphChoice', value: JSON.stringify(pendingAttemptState)});
        setModalVisible(false);
    }

    function handleKeyPress(ev: KeyboardEvent) {
        if (ev.code === 'Escape') {
            closeModal();
        }
    }

    useEffect(() => {
        window.addEventListener('keyup', handleKeyPress);

        return () => {
            window.removeEventListener('keyup', handleKeyPress);
        }
    }, []);

    useEffect(() => {
        const { sketch, p } = makeGraphSketcher(previewRef.current || undefined, 600, 400, { previewMode: true, initialCurves: initialState?.curves });
        if (sketch) {
            sketch.selectedLineType = LineType.BEZIER;
            setPreviewSketch(sketch);
        }
        return () => {
            previewSketch?.teardown();
            setPreviewSketch(null);
            if (previewRef.current) {
                for (const canvas of previewRef.current.getElementsByTagName('canvas')) {
                    previewRef.current.removeChild(canvas);
                }
            }
            p.remove();
        }
    }, []);

    useEffect(() => {
        // Set the state of the preview box whenever currentAttempt changes
        if (previewSketch && currentAttempt?.value) {
            const data: GraphSketcherState = JSON.parse(currentAttempt.value);
            data.canvasWidth = 600;
            data.canvasHeight = 400;
            data.curves = data.curves || initialState?.curves || [];
            previewSketch.state = data;
        }
    }, [currentAttempt]);

    return <div className="graph-sketcher-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <div className="sketch-preview text-center" onClick={openModal} onKeyUp={openModal} role={readonly ? undefined : "button"}
             tabIndex={readonly ? undefined : 0}>
            <div ref={previewRef} className={`${questionId}-graph-sketcher-preview`} />
        </div>
        {modalVisible && <GraphSketcherModal
            close={closeModal}
            onGraphSketcherStateChange={setPendingAttemptState}
            initialState={initialState}
            question={doc}
            allowMultiValuedFunctions={isStaff(user)}
        />}
    </div>
};
export default IsaacGraphSketcherQuestion;