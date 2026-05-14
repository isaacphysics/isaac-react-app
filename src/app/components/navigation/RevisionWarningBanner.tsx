import React from "react";
import {AppState, selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";
import { Alert } from "reactstrap";
import { useTranslation, Trans } from 'react-i18next'

export function RevisionWarningBanner() {
    const { t } = useTranslation()

    const hideAttempts: boolean = useAppSelector(
        (state: AppState) => state?.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS
    ) ?? false;
    const hiddenAttempts: boolean = useAppSelector(selectors.questions.anyQuestionHidden);
    const mostRecentAttemptDate = useAppSelector(selectors.questions.getMostRecentCorrectAttemptDate);

    if (hideAttempts && hiddenAttempts) {
        const timespan = !mostRecentAttemptDate 
            ? undefined 
            : mostRecentAttemptDate < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
                ? t('moreThan1YearAgo', 'more than 1 year ago') 
                : mostRecentAttemptDate < new Date(new Date().setMonth(new Date().getMonth() - 1)) 
                    ? t('inTheLast12Months', 'in the last 12 months') 
                    : mostRecentAttemptDate < new Date(new Date().setDate(new Date().getDate() - 7)) 
                        ? t('inTheLastMonth', 'in the last month') 
                        : t('inTheLastWeek', 'in the last week');

        return <Alert color="warning" className={"no-print"}>
            <span><Trans i18nKey="youAreCurrentlyInAHrefaccountbetafeaturesrevisionModeaWhichHidesYourPreviousAttempts">You are currently in <a href="\account#betafeatures">revision mode</a> which hides your previous attempts.</Trans></span>
            {timespan && <>
                <br/><br/><span>{t('youAnsweredThisQuestionCorrectlyTimespan', 'You answered this question correctly {{timespan}}.', { timespan })}</span>
            </>}
        </Alert>;
    } else {
        return RenderNothing;
    }
}
