import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacLLMFreeTextQuestionDTO, LLMFreeTextChoiceDTO} from "../../../IsaacApiTypes";
import {FormGroup, Input} from "reactstrap";
import {IsaacQuestionProps, ValidatedChoice} from "../../../IsaacAppTypes";
import {useCurrentQuestionAttempt} from "../../services";
import {useCanAttemptQuestionTypeQuery} from "../../state";
import { LLMFreeTextQuestionRemainingAttemptsView } from "../elements/LLMFreeTextQuestionRemainingAttemptsView";

interface Limit {
    exceeded: boolean;
    limit: number;
    current: number;
}

interface Validation {
    validValue: boolean;
    wordLimit: Limit;
    charLimit: Limit;
    piiDetected?: boolean;
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

    const emailDetected = !!answer.match(/[\w.-]+@[\w.-]+\.\w+/g);
    const postCodeDetected = !!answer.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]? [0-9][A-Z]{2}/g);
    const piiDetected = emailDetected || postCodeDetected;

    const validValue = !wordLimitExceeded && !charLimitExceeded && !piiDetected;

    return {
        validValue,
        piiDetected,
        wordLimit : {exceeded: wordLimitExceeded, limit: wordLimit, current: currentNumberOfWords},
        charLimit : {exceeded: charLimitExceeded, limit: charLimit, current: currentNumberOfChars}
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

const FreeTextEntryValidation = ({validValue, wordLimit, charLimit, piiDetected}: Validation) => {
    return validValue ? null
        : <div className="no-print text-failed">
            {charLimit.exceeded && <div><span className="icon-error" /> Character limit exceeded ({charLimit.current}/{charLimit.limit})</div>}
            {wordLimit.exceeded && <div><span className="icon-error" /> Word limit exceeded ({wordLimit.current}/{wordLimit.limit})</div>}
            {piiDetected && <div className="d-flex">
                <span className="icon-error" />
                <span className="ms-1">
                    <strong>Possible PII detected:</strong><br />
                    It looks like your answer contains personal information, like a name, email or street address. Sending this data to OpenAI is against their Usage policy.
                </span>
            </div>}
        </div>;
};

const IsaacLLMFreeTextQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacLLMFreeTextQuestionDTO>) => {
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt(questionId);

    const canAttemptQuestionType = useCanAttemptQuestionTypeQuery(doc.type as string);
    const currentAttemptValue = currentAttempt?.value ?? "";
    const validation = validate(currentAttemptValue);

    return (
        <div className="freetext-question">
            <LLMFreeTextQuestionRemainingAttemptsView canAttemptQuestionType={canAttemptQuestionType} />
            <div className="question-content">
                <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                    {doc.children}
                </IsaacContentValueOrChildren>
                {doc.maxMarks && <p><strong>{`[${doc.maxMarks} mark${doc.maxMarks > 1 ? "s" : ""}]`}</strong></p>}
            </div>
            <FormGroup className="mb-4">
                <Input type="textarea"
                    disabled={canAttemptQuestionType.isError || readonly}
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
