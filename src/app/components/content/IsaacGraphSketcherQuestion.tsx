import React, {useState, useEffect, useRef} from "react";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacTabbedHints} from "./IsaacHints";
import {GraphSketcherModal} from "../elements/modals/GraphSketcherModal";
import {GraphSketcher, makeGraphSketcher, LineType, GraphSketcherState} from "isaac-graph-sketcher/dist/src/GraphSketcher";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

export const IsaacGraphSketcherQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacGraphSketcherQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<GraphChoiceDTO>(questionId);

    const [modalVisible, setModalVisible] = useState(false);
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const initialState: GraphSketcherState | undefined = currentAttempt?.value ? JSON.parse(currentAttempt?.value) : undefined;
    const previewRef = useRef(null);

    function openModal() {
        !readonly && setModalVisible(true);
    }

    function closeModal() {
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

    const onGraphSketcherStateChange = (newState: GraphSketcherState) => {
        dispatchSetCurrentAttempt({type: 'graphChoice', value: JSON.stringify(newState)});
        if (previewSketch) {
            previewSketch.state = newState;
            previewSketch.state.curves = previewSketch.state.curves || [];
        }
    };

    useEffect(() => {
        if (previewSketch) return;
        if (makeGraphSketcher && previewRef.current) {
            const { sketch } = makeGraphSketcher(previewRef.current || undefined, 600, 400, { previewMode: true });
            if (sketch) {
                sketch.selectedLineType = LineType.BEZIER;
                setPreviewSketch(sketch);
            }
        }
    }, [previewRef, previewSketch]);

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
        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role={readonly ? undefined : "button"}
             tabIndex={readonly ? undefined : 0}>
            <div ref={previewRef} className={`${questionId}-graph-sketcher-preview`} />
        </div>
        {modalVisible && <GraphSketcherModal
            close={closeModal}
            onGraphSketcherStateChange={onGraphSketcherStateChange}
            initialState={initialState}
        />}
        <IsaacTabbedHints questionPartId={questionId} hints={doc.hints} />
    </div>
};
