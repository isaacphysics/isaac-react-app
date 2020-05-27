import React, {useState, useEffect, useCallback} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {GraphChoiceDTO, IsaacGraphSketcherQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacTabbedHints} from "./IsaacHints";
import {questions} from "../../state/selectors";
import { GraphSketcherModal } from "../elements/modals/GraphSketcherModal";
import {debounce} from "lodash";

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

    // This is debounced here because the graph sketcher upstream calls this
    // on every redraw, which happens on every mouse movement.
    // TODO: Ideally fix this upstream.
    const updateCurrentAttempt = useCallback(
        debounce((newState: any) => {
            setCurrentAttempt(questionId, {type: 'graphChoice', value: JSON.stringify(newState)});
        }, 250),
        []
    );

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
        {modalVisible && <GraphSketcherModal
            close={closeModal}
            onGraphSketcherStateChange={updateCurrentAttempt}
        />}
        Hints: <IsaacTabbedHints questionPartId={questionId} hints={doc.hints} />
    </div>
};

export const IsaacGraphSketcherQuestion = connect(stateToProps, dispatchToProps)(IsaacGraphSketcherQuestionComponent);
