import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacLLMFreeTextQuestionDTO, LLMFreeTextChoiceDTO} from "../../../IsaacApiTypes";
import {Alert, FormGroup, Input} from "reactstrap";
import {IsaacQuestionProps, ValidatedChoice} from "../../../IsaacAppTypes";
import {useCurrentQuestionAttempt} from "../../services";

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
    // 10 sentences, 20 words per sentence = 200 words
    // 4-7 characters per word = 1400 characters
    const wordLimit = 200;
    const charLimit = 1400;
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

function validatedChoiceDtoFromEvent(event: React.ChangeEvent<HTMLInputElement>): ValidatedChoice<LLMFreeTextChoiceDTO> {
    const value = event.target.value;
    const frontEndValidation = validate(value).validValue;
    return {
        choice: {type: "llmFreeTextChoice", value},
        frontEndValidation
    };
}

const FreeTextEntryValidation = ({validValue, wordLimit, charLimit}: Validation) => {
    return validValue ? null
        : <Alert color="warning" className={"no-print"}>
            <strong>Warning:</strong>
            <ul>
                {charLimit.exceeded && <li>Character limit exceeded ({charLimit.current}/{charLimit.limit})</li>}
                {wordLimit.exceeded && <li>Word limit exceeded ({wordLimit.current}/{wordLimit.limit})</li>}
            </ul>
        </Alert>;
};

const IsaacLLMFreeTextQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacLLMFreeTextQuestionDTO>) => {

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
            <FreeTextEntryValidation {...validation} />
        </div>
    );
};
export default IsaacLLMFreeTextQuestion;