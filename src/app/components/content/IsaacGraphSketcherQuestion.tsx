import React, {useState, useEffect, useRef} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacTabbedHints} from "./IsaacHints";
import {selectors} from "../../state/selectors";
import {GraphSketcherModal} from "../elements/modals/GraphSketcherModal";
import {selectQuestionPart} from "../../services/questions";
import {GraphSketcher, makeGraphSketcher, LineType, GraphSketcherState} from "isaac-graph-sketcher/dist/src/GraphSketcher";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const pageQuestions = selectors.questions.getQuestions(state);
    const questionPart = selectQuestionPart(pageQuestions, questionId);
    let r: {currentAttempt?: GraphChoiceDTO | null} = {};
    if (questionPart) {
        r.currentAttempt = questionPart.currentAttempt;
    }
    return r;
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacGraphSketcherQuestionProps {
    doc: IsaacGraphSketcherQuestionDTO;
    questionId: string;
    currentAttempt?: GraphChoiceDTO | null;
    setCurrentAttempt: (questionId: string, attempt: GraphChoiceDTO) => void;
}
const IsaacGraphSketcherQuestionComponent = (props: IsaacGraphSketcherQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const [previewSketch, setPreviewSketch] = useState<GraphSketcher>();
    const initialState: GraphSketcherState | undefined = currentAttempt?.value ? JSON.parse(currentAttempt?.value) : undefined;
    const previewRef = useRef(null);

    function openModal() {
        setModalVisible(true);
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
        setCurrentAttempt(questionId, {type: 'graphChoice', value: JSON.stringify(newState)});
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
        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role="button" tabIndex={0}>
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

export const IsaacGraphSketcherQuestion = connect(stateToProps, dispatchToProps)(IsaacGraphSketcherQuestionComponent);
