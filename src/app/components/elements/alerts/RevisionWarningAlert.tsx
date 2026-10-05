import React from "react";
import {AppState, selectors, useAppSelector} from "../../../state";
import {RenderNothing} from "../RenderNothing";
import { Alert } from "reactstrap";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../TransAnchor";

export function RevisionWarningAlert() {
    const { t } = useTranslation();

    const hideAttempts: boolean = useAppSelector(
        (state: AppState) => state?.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS
    ) ?? false;
    const hiddenAttempts: boolean = useAppSelector(selectors.questions.anyQuestionHidden);
    const mostRecentAttemptDate = useAppSelector(selectors.questions.getMostRecentCorrectAttemptDate);

    if (hideAttempts && hiddenAttempts) {
        const timespan = !mostRecentAttemptDate 
            ? undefined 
            : mostRecentAttemptDate < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
                ? t("common:revision.alert.overOneYear") 
                : mostRecentAttemptDate < new Date(new Date().setMonth(new Date().getMonth() - 1)) 
                    ? t("common:revision.alert.lastTwelveMonths") 
                    : mostRecentAttemptDate < new Date(new Date().setDate(new Date().getDate() - 7)) 
                        ? t("common:revision.alert.lastMonth") 
                        : t("common:revision.alert.lastWeek");

        return <Alert color="warning" className={"no-print"}>
            <span><Trans
                i18nKey="common:revision.alert.modeNotice"
                components={{
                    revisionModeLink: <TransAnchor href="\account#betafeatures" />,
                }}
            /></span>
            {timespan && <>
                <br/><br/><span>{t("common:revision.alert.correctAnswerTimespan", { timespan })}</span>
            </>}
        </Alert>;
    } else {
        return RenderNothing;
    }
}
