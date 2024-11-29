import React from "react";
import {AppState, selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";
import { Alert } from "reactstrap";

export function RevisionWarningBanner() {

    const hideAttempts: boolean = useAppSelector(
        (state: AppState) => state?.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS
    ) ?? false;
    const hiddenAttempts: boolean = useAppSelector(selectors.questions.anyQuestionHidden);
    const mostRecentAttemptDate = useAppSelector(selectors.questions.getMostRecentCorrectAttemptDate);

    if (hideAttempts && hiddenAttempts) {
        const timespan = !mostRecentAttemptDate 
            ? undefined 
            : mostRecentAttemptDate < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
                ? "more than 1 year ago" 
                : mostRecentAttemptDate < new Date(new Date().setMonth(new Date().getMonth() - 1)) 
                    ? "in the last 12 months" 
                    : mostRecentAttemptDate < new Date(new Date().setDate(new Date().getDate() - 7)) 
                        ? "in the last month" 
                        : "in the last week";

        return <Alert color="warning" className={"no-print"}>
            <span>You are currently in <a href="\account#betafeatures">revision mode</a> which hides your previous attempts.</span>
            {timespan && <>
                <br/><br/><span>You answered this question correctly {timespan}.</span>
            </>}
        </Alert>;
    } else {
        return RenderNothing;
    }
}
