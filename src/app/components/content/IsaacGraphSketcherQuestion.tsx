import React, {useState, useEffect, useCallback, useRef} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacTabbedHints} from "./IsaacHints";
import {questions} from "../../state/selectors";
import {GraphSketcherModal} from "../elements/modals/GraphSketcherModal";
import {debounce} from "lodash";

import {GraphSketcher, makeGraphSketcher, LineType, Curve, GraphSketcherState} from "isaac-graph-sketcher/src/GraphSketcher";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    const questionPart = questions.selectQuestionPart(questionId)(state);
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
    const [initialData, setInitialData] = useState<{ curves: Curve[]; canvasWidth: number; canvasHeight: number }>();
    const [initialDataAssigned, setInitialDataAssigned] = useState(false);

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

    // This is debounced here because the graph sketcher upstream calls this
    // on every redraw, which happens on every mouse event.
    // TODO: Ideally fix this upstream.
    const onGraphSketcherStateChange = useCallback((newState: GraphSketcherState) => {
        console.log(newState);
        setCurrentAttempt(questionId, {type: 'graphChoice', value: JSON.stringify(newState)});
    }, []);

    useEffect(() => {
        // componentDidMount
        // console.log("componentDidMount: ", questionId);
        window.addEventListener('keyup', handleKeyPress);
        if (currentAttempt?.value) {
            setInitialData(JSON.parse(currentAttempt.value).curves);
        }

        return () => {
            // componentWillUnmount
            window.removeEventListener('keyup', handleKeyPress);
        }
    }, []);

    useEffect(() => {
        // Only ever set initial curves once and not on every currentAttempt update (state var seems to work)
        if (currentAttempt?.value && !initialDataAssigned) {
            setInitialDataAssigned(true);
            setInitialData(JSON.parse(currentAttempt?.value).curves);
        }
    }, [currentAttempt]);

    const previewRef = useRef(null);
    useEffect(() => {
        if (previewSketch) return;
        if (makeGraphSketcher && previewRef.current) {
            const { sketch } = makeGraphSketcher(previewRef.current || undefined, 600, 400, { previewMode: true });

            if (sketch) {
                sketch.selectedLineType = LineType.BEZIER;
                setPreviewSketch(sketch);
            }
        }
    }, [previewRef]);

    useEffect(() => {
        if (previewSketch && currentAttempt?.value) {
            // console.log(questionId, currentAttempt?.value);
            const data = JSON.parse(currentAttempt.value);
            data.canvasWidth = 600;
            data.canvasHeight = 400;
            previewSketch.data = data;
        }
    }, [currentAttempt, previewSketch]);

    return <div className="graph-sketcher-question">
        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role="button" tabIndex={0}>
            <div ref={previewRef} className={`${questionId}-graph-sketcher-preview`} />
            PREVIEW: Click here to answer.
            {currentAttempt?.value}
        </div>
        {modalVisible && <GraphSketcherModal
            close={closeModal}
            onGraphSketcherStateChange={onGraphSketcherStateChange}
            initialCurves={initialData}
        />}
        Hints: <IsaacTabbedHints questionPartId={questionId} hints={doc.hints} />
    </div>
};

export const IsaacGraphSketcherQuestion = connect(stateToProps, dispatchToProps)(IsaacGraphSketcherQuestionComponent);
