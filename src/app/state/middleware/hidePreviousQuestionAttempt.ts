import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {BEST_ATTEMPT_HIDDEN} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

export const hidePreviousQuestionAttemptMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {
    if (action.type === ACTION_TYPE.QUESTION_REGISTRATION) {
        const state = middlewareApi.getState();
        if (!action.isQuiz && state.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
            return dispatch({
                type: ACTION_TYPE.QUESTION_REGISTRATION,
                questions: action.questions.map(q => ({
                    ...q,
                    bestAttempt: BEST_ATTEMPT_HIDDEN
                })),
                accordionClientId: action.accordionClientId
            });
        }
    }
    return dispatch(action);
}
