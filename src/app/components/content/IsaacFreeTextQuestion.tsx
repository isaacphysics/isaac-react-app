import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {AppState} from "../../state/reducers";
import {ChoiceDTO, IsaacFreeTextQuestionDTO, StringChoiceDTO} from "../../../IsaacApiTypes";
import {Alert, FormGroup, Input} from "reactstrap";
import {ValidatedChoice} from "../../../IsaacAppTypes";
import {IsaacHints} from "./IsaacHints";

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
    setCurrentAttempt: (questionId: string, attempt: ValidatedChoice<ChoiceDTO>) => void;
}

interface Limit {
    exceeded: boolean;
    limit: number;
    current: number;
}

interface Validation {
    validValue: boolean;
    wordLimit: Limit;
    charLimit: Limit;
}

function validate(answer: string): Validation {
    const wordLimit = 20;
    const charLimit = 200;
    const wordMatches = answer.match(/\S+/g);
    const currentNumberOfWords = wordMatches ? wordMatches.length : 0;
    const currentNumberOfChars = answer.length;

    const wordLimitExceeded = currentNumberOfWords > wordLimit;
    const charLimitExceeded = currentNumberOfChars > charLimit;

    const validValue = !wordLimitExceeded && !charLimitExceeded;

    return {
        validValue,
        wordLimit : {exceeded: wordLimitExceeded, limit: wordLimit, current: currentNumberOfWords},
        charLimit : {exceeded: charLimitExceeded, limit: charLimit, current: currentNumberOfChars},
    };
}

function validatedChoiceDTOfromEvent(event: React.ChangeEvent<HTMLInputElement>): ValidatedChoice<StringChoiceDTO> {
    const value = event.target.value;
    const frontEndValidation = validate(value).validValue;
    return {
        choice: {
            type: "stringChoice", // Note there is no freeTextChoice
            value
        },
        frontEndValidation
    };
}

const FreeTextValidation = ({validValue, wordLimit, charLimit}: Validation) => {
    return validValue ? null
        : <Alert color="warning">
            <strong>Warning:</strong>
            <ul>
                {charLimit.exceeded && <li>Character limit exceeded ({charLimit.current}/{charLimit.limit})</li>}
                {wordLimit.exceeded && <li>Word limit exceeded ({wordLimit.current}/{wordLimit.limit})</li>}
            </ul>
        </Alert>;
};

const IsaacFreeTextQuestionComponent = (props: IsaacFreeTextQuestionProps) => {
    const {doc, questionId, currentAttempt, setCurrentAttempt} = props;
    const currentAttemptValue = currentAttempt && currentAttempt.value || "";

    const validation = validate(currentAttemptValue);

    return (
        <div>
            <h4>
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </h4>
            <FormGroup className="mb-4">
                <Input type="textarea"
                    placeholder="Type your answer here."
                    spellCheck={true}
                    rows={3}
                    value={currentAttemptValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setCurrentAttempt(questionId, validatedChoiceDTOfromEvent(event))}/>
            </FormGroup>
            <FreeTextValidation {...validation} />
            <IsaacHints hints={doc.hints}/>
        </div>
    );
};

export const IsaacFreeTextQuestion = connect(stateToProps, dispatchToProps)(IsaacFreeTextQuestionComponent);
