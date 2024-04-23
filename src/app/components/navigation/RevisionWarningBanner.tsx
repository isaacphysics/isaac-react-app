import React from "react";
import * as RS from "reactstrap";
import {AppState, selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";

export function RevisionWarningBanner() {

    const hideAttempts: boolean = useAppSelector(
        (state: AppState) => state?.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS
    ) ?? false;
    const hiddenAttempts: boolean = useAppSelector(selectors.questions.anyQuestionHidden);

    if (hideAttempts && hiddenAttempts) {
        return <RS.Alert color="warning" className={"no-print"}>
            You have attempted this question before, but you are <a href="\account#betafeatures">hiding your past attempts</a>.
        </RS.Alert>;
    } else {
        return RenderNothing;
    }
}
