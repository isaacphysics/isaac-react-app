import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

export const hidePreviousQuestionAttempt: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {
    if (action.type === ACTION_TYPE.QUESTION_REGISTRATION) {
        const state = middlewareApi.getState();
        if (state.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
            return dispatch({
                type: ACTION_TYPE.QUESTION_REGISTRATION,
                question: {
                    ...action.question,
                    bestAttempt: undefined
                },
                accordionClientId: action.accordionClientId
            })
        }
    }
    return dispatch(action);
}
