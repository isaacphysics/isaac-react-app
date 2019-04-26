import React, {useState} from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacSymbolicLogicQuestionDTO} from "../../../IsaacApiTypes";
import { InequalityModal } from "./InequalityModal";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacSymbolicLogicQuestionProps {
    doc: IsaacSymbolicLogicQuestionDTO,
    questionId: string,
    currentAttempt?: ChoiceDTO,
    showInequality?: boolean,
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void
}
const IsaacSymbolicLogicQuestionComponent = (props: IsaacSymbolicLogicQuestionProps) => {

    const [modalVisible, setModalVisible] = useState(false);

    const {doc, questionId, currentAttempt, showInequality, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    const inequalityModal = modalVisible ? <InequalityModal
        close={() => setModalVisible(false)}
        availableSymbols={doc.availableSymbols}
        /> : (void null);

    return (
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <div className="eqn-editor-preview" onClick={() => setModalVisible(true)}>TEST</div>
            {inequalityModal}
        </div>
    );
};

export const IsaacSymbolicLogicQuestion = connect(stateToProps, dispatchToProps)(IsaacSymbolicLogicQuestionComponent);
