import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacMultiChoiceQuestionDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacMultiChoiceQuestionProps {
    doc: IsaacMultiChoiceQuestionDTO,
    questionId: string,
    currentAttempt?: ChoiceDTO
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void
}
const IsaacMultiChoiceQuestionComponent = (props: IsaacMultiChoiceQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    return (
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <ul>{doc.choices && doc.choices.map((choice, index) =>
                <li key={index}>
                    <input
                        type="radio"
                        checked={currentAttemptValue == choice.value}
                        onClick={() => setCurrentAttempt(questionId, choice)}
                        readOnly
                    />
                    <label>
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} children={[]} />
                    </label>
                </li>)
            }</ul>
        </div>
    );
};

export const IsaacMultiChoiceQuestion = connect(stateToProps, dispatchToProps)(IsaacMultiChoiceQuestionComponent);
