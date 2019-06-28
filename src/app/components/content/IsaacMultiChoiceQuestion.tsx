import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacMultiChoiceQuestionDTO} from "../../../IsaacApiTypes";
import {IsaacHints} from "./IsaacHints";
import {CustomInput, Label} from "reactstrap";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacMultiChoiceQuestionProps {
    doc: IsaacMultiChoiceQuestionDTO;
    questionId: string;
    currentAttempt?: ChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void;
}

const IsaacMultiChoiceQuestionComponent = (props: IsaacMultiChoiceQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;

    return (
        <div className="multichoice-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>

            <ul>{doc.choices && doc.choices.map((choice, index) =>
                <li key={choice.value} className="list-unstyled">
                    <Label className="label-radio multichoice-option">
                        <CustomInput
                            id={`${questionId}${index}`}
                            color="secondary"
                            type="radio"
                            checked={currentAttemptValue == choice.value}
                            onChange={() => setCurrentAttempt(questionId, choice)}
                        />
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} />
                    </Label>
                </li>)
            }</ul>

            <IsaacHints questionPartId={questionId} hints={doc.hints}/>
        </div>
    );
};

export const IsaacMultiChoiceQuestion = connect(stateToProps, dispatchToProps)(IsaacMultiChoiceQuestionComponent);
