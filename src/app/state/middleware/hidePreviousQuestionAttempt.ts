import {Middleware, MiddlewareAPI} from "redux";
import {BEST_ATTEMPT_HIDDEN} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";
import {userApi} from "../../state";
import {AppDispatch} from "../store";

export const hidePreviousQuestionAttemptMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (next: AppDispatch) => async (action: Action) => {
    if (action.type === ACTION_TYPE.QUESTION_REGISTRATION) {
        const {data: userPreferences} = await middlewareApi.dispatch(userApi.endpoints.getUserPreferences.initiate() as any);
        if (!action.isQuiz && userPreferences?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS) {
            return next({
                type: ACTION_TYPE.QUESTION_REGISTRATION,
                questions: action.questions.map(q => ({
                    ...q,
                    bestAttempt: q.bestAttempt && BEST_ATTEMPT_HIDDEN
                })),
                accordionClientId: action.accordionClientId
            });
        }
    }
    return next(action);
}
