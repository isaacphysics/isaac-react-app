import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacStringMatchQuestionDTO, StringChoiceDTO} from "../../../IsaacApiTypes";
import {Input} from "reactstrap";
import {IsaacHints} from "./IsaacHints";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacStringMatchQuestionProps {
    doc: IsaacStringMatchQuestionDTO;
    questionId: string;
    currentAttempt?: ChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void;
}

function choiceDTOfromEvent(event: React.ChangeEvent<HTMLInputElement>): StringChoiceDTO {
    return {
        type: "stringChoice",
        value: event.target.value
    };
}

const IsaacStringMatchQuestionComponent = (props: IsaacStringMatchQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    return (
        <div className="stringmatch-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            <Input type={doc.multiLineEntry ? "textarea" : "text"} placeholder="Type your answer here."
                maxLength={doc.multiLineEntry ? 250 : 75}
                spellCheck={false} className="mb-4"
                rows={doc.multiLineEntry ? 3 : undefined}
                value={currentAttemptValue || ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentAttempt(questionId, choiceDTOfromEvent(event))}/>
            <IsaacHints hints={doc.hints}/>
        </div>
    );
};

export const IsaacStringMatchQuestion = connect(stateToProps, dispatchToProps)(IsaacStringMatchQuestionComponent);
