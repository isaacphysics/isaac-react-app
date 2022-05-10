import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacFreeTextQuestionDTO, StringChoiceDTO} from "../../../IsaacApiTypes";
import {Alert, FormGroup, Input} from "reactstrap";
import {IsaacQuestionProps, ValidatedChoice} from "../../../IsaacAppTypes";
import {useCurrentQuestionAttempt} from "../../services/questions";

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

function validatedChoiceDtoFromEvent(event: React.ChangeEvent<HTMLInputElement>): ValidatedChoice<StringChoiceDTO> {
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
        : <Alert color="warning" className={"no-print"}>
            <strong>Warning:</strong>
            <ul>
                {charLimit.exceeded && <li>Character limit exceeded ({charLimit.current}/{charLimit.limit})</li>}
                {wordLimit.exceeded && <li>Word limit exceeded ({wordLimit.current}/{wordLimit.limit})</li>}
            </ul>
        </Alert>;
};

export const IsaacFreeTextQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacFreeTextQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt(questionId);

    const currentAttemptValue = currentAttempt?.value ?? "";
    const validation = validate(currentAttemptValue);

    return (
        <div className="freetext-question">
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
            </div>
            <FormGroup className="mb-4">
                <Input type="textarea"
                    placeholder="Type your answer here."
                    spellCheck={true}
                    rows={3}
                    value={currentAttemptValue}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        dispatchSetCurrentAttempt(validatedChoiceDtoFromEvent(event))}
                    readOnly={readonly}
                />
            </FormGroup>
            <FreeTextValidation {...validation} />
        </div>
    );
};
