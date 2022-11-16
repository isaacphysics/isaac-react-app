import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from "redux";
import {BEST_ATTEMPT_HIDDEN} from "../../../IsaacApiTypes";
import {questionsSlice} from "../reducers/questionState";

export const hidePreviousQuestionAttemptMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: AnyAction) => {
    if (questionsSlice.actions.registerQuestions.match(action)) {
        const state = middlewareApi.getState();
        if (state.userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
            return dispatch({
                ...action,
                payload: {
                    questions: action.payload.questions.map(q => ({
                        ...q,
                        bestAttempt: BEST_ATTEMPT_HIDDEN
                    })),
                    accordionClientId: action.payload.accordionClientId
                }
            });
        }
    }
    return dispatch(action);
}
