import React from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useCanAttemptQuestionTypeQuery } from "../../state";
import { TOO_MANY_REQUESTS, isDefined } from "../../services";
import classNames from "classnames";
import { useTranslation } from "react-i18next";


export function LLMFreeTextQuestionRemainingAttemptsView({canAttemptQuestionType}: {canAttemptQuestionType: ReturnType<typeof useCanAttemptQuestionTypeQuery>}) {
    const { t } = useTranslation();
    let remainingAttempts: number | null = null;
    if (canAttemptQuestionType.isSuccess) {
        remainingAttempts = canAttemptQuestionType.data?.remainingAttempts;
    } else if (canAttemptQuestionType.isError && canAttemptQuestionType.error?.status === TOO_MANY_REQUESTS) {
        remainingAttempts = 0;
    }

    if (!isDefined(remainingAttempts)) return null;
    
    return <p>
        <span aria-haspopup="true" className="btn-link has-tip" id="attempt-limit-help">
            {t("common:freeTextBuilder.attempts.remaining", { count: remainingAttempts })}
            <i className={classNames("icon icon-info icon-inline mx-2")} />
        </span>
        <UncontrolledTooltip innerClassName="attempt-limit-tooltip" placement="bottom" target="attempt-limit-help">
            {t("site:freeTextBuilder.attempts.explanation")}
        </UncontrolledTooltip>
    </p>;
}
