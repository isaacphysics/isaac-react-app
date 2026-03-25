import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useCanAttemptQuestionTypeQuery } from "../../state";
import { TOO_MANY_REQUESTS, isDefined, siteSpecific } from "../../services";
import classNames from "classnames";


export function LLMFreeTextQuestionRemainingAttemptsView({canAttemptQuestionType}: {canAttemptQuestionType: ReturnType<typeof useCanAttemptQuestionTypeQuery>}) {
    let remainingAttempts: number | null = null;
    if (canAttemptQuestionType.isSuccess) {
        remainingAttempts = canAttemptQuestionType.data?.remainingAttempts;
    } else if (canAttemptQuestionType.isError && canAttemptQuestionType.error?.status === TOO_MANY_REQUESTS) {
        remainingAttempts = 0;
    }

    if (!isDefined(remainingAttempts)) return null;
    
    return <p>
        <span aria-haspopup="true" className="btn-link has-tip" id="attempt-limit-help">
            {remainingAttempts} attempts remaining today
            <i className={classNames("icon icon-info icon-inline mx-2")} />
        </span>
        <UncontrolledTooltip innerClassName="attempt-limit-tooltip" placement="bottom" target="attempt-limit-help">
            {`Using a large language model (LLM) to mark free text questions costs money, and we have a fixed monthly budget.
            To keep things fair, we set a daily cap per user so that everyone using the platform has an equal opportunity to use this tool.
            This is in line with our mission to make ${siteSpecific("science", "computer science")} accessible to all.`}
        </UncontrolledTooltip>
    </p>;
}
