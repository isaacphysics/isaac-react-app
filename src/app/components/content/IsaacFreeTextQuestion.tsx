import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacFreeTextQuestionDTO, StringChoiceDTO} from "../../../IsaacApiTypes";
import {Alert, Input} from "reactstrap";

const stateToProps = (state: AppState, {questionId}: {questionId: string}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == questionId)[0];
    return question ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

interface IsaacFreeTextQuestionProps {
    doc: IsaacFreeTextQuestionDTO;
    questionId: string;
    currentAttempt?: ChoiceDTO;
    setCurrentAttempt: (questionId: string, attempt: ChoiceDTO) => void;
}

function choiceDTOfromEvent(event: React.ChangeEvent<HTMLInputElement>): StringChoiceDTO {
    return {
        type: "stringChoice", // Note there is no FreeTextChoice
        value: event.target.value
    };
}

const IsaacFreeTextQuestionComponent = (props: IsaacFreeTextQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value || "";

    const wordLimit = 20;
    const charLimit = 200;
    const wordMatches = currentAttemptValue.match(/\S+/g);
    const currentNumberOfWords = wordMatches ? wordMatches.length : 0;
    const currentNumberOfChars = currentAttemptValue.length;

    const wordLimitExceeded = currentNumberOfWords > wordLimit;
    const charLimitExceeded = currentNumberOfChars > charLimit;

    const validValue = !wordLimitExceeded && !charLimitExceeded;
    // TODO: Pass validValue as passedFrontEndValidation through in the choiceDTO and then make QuestionTabs look at it to allow submission only when true

    return (
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <Input placeholder="Type your answer here."
                spellCheck={true}
                rows={3}
                value={currentAttemptValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentAttempt(questionId, choiceDTOfromEvent(event))}/>
            {!validValue && <Alert color="warning">
                <strong>Warning:</strong>
                <ul>
                    {charLimitExceeded && <li>Character limit exceeded ({currentNumberOfChars}/{charLimit})</li>}
                    {wordLimitExceeded && <li>Word limit exceeded ({currentNumberOfWords}/{wordLimit})</li>}
                </ul>
            </Alert>}
        </div>
    );
};

export const IsaacFreeTextQuestion = connect(stateToProps, dispatchToProps)(IsaacFreeTextQuestionComponent);
