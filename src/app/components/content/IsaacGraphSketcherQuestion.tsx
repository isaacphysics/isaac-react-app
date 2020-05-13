import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacTabbedHints} from "./IsaacHints";
import {ifKeyIsEnter} from "../../services/navigation";
import {questions} from "../../state/selectors";
import { GraphSketcherModal } from "../elements/modals/GraphSketcherModal";

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
        // componentDidMount
        window.addEventListener('keyup', handleKeyPress);

        return () => {
            // componentWillUnmount
            window.removeEventListener('keyup', handleKeyPress);
        }
    }, []);


    return <div className="graph-sketcher-question">
        <div className="sketch-preview" onClick={openModal} onKeyUp={openModal} role="button" tabIndex={0}>PREVIEW: Click here to answer.</div>
        {modalVisible && <GraphSketcherModal></GraphSketcherModal>}
        Hints: <IsaacTabbedHints questionPartId={questionId} hints={doc.hints} />
    </div>
};

export const IsaacGraphSketcherQuestion = connect(stateToProps, dispatchToProps)(IsaacGraphSketcherQuestionComponent);
