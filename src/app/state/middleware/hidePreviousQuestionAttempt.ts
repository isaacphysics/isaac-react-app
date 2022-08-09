import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {BEST_ATTEMPT_HIDDEN} from "../../../IsaacApiTypes";

export const hidePreviousQuestionAttempt: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {
    if (action.type === ACTION_TYPE.QUESTION_REGISTRATION) {
        const state = middlewareApi.getState();
        if (state.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS && action.question.bestAttempt) {
            return dispatch({
                type: ACTION_TYPE.QUESTION_REGISTRATION,
                question: {
                    ...action.question,
                    bestAttempt: BEST_ATTEMPT_HIDDEN
                },
                accordionClientId: action.accordionClientId
            })
        }
    }
    return dispatch(action);
}
