import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useCanAttemptQuestionTypeQuery } from "../../state";
import { TOO_MANY_REQUESTS, isDefined } from "../../services";


export function LLMFreeTextQuestionRemainingAttemptsView({canAttemptQuestionType}: {canAttemptQuestionType: ReturnType<typeof useCanAttemptQuestionTypeQuery>}) {
    let remainingAttempts: number | null = null;
    if (canAttemptQuestionType.isSuccess) {
        remainingAttempts = canAttemptQuestionType.data?.remainingAttempts;
    } else if (canAttemptQuestionType.isError && canAttemptQuestionType.error?.status === TOO_MANY_REQUESTS) {
        remainingAttempts = 0;
    }

    if (!isDefined(remainingAttempts)) return null;
    
    return <p className="btn-link">
        <span aria-haspopup="true" className="has-tip">
            {remainingAttempts} attempts remaining today<span className="icon-help" id="attempt-limit-help" />
        </span>
        <UncontrolledTooltip innerClassName="attempt-limit-tooltip" trigger="click" placement="bottom" target="attempt-limit-help">
            Using a large language model (LLM) to mark free text questions costs money, and we have a fixed monthly budget.
            To keep things fair, we set a daily cap per user so that everyone using the platform has an equal opportunity to use this tool.
            This is in line with our mission to make computer science accessible to all.
        </UncontrolledTooltip>
    </p>;
}
