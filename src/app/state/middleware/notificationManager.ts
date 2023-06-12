import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {
    ACTION_TYPE,
    allRequiredInformationIsPresent,
    isDefined,
    isLoggedIn,
    KEY,
    persistence,
    withinLast2Hours
} from "../../services";
import {Action} from "../../../IsaacAppTypes";
import {logAction, needToUpdateUserContextDetails, openActiveModal, routerPageChange} from "../index";
import {requiredAccountInformationModal} from "../../components/elements/modals/RequiredAccountInformationModal";
import {loginOrSignUpModal} from "../../components/elements/modals/LoginOrSignUpModal";
import {userContextReconfirmationModal} from "../../components/elements/modals/UserContextReconfirmationModal";

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {

    const state = middlewareApi.getState();
    if([ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, routerPageChange.type].includes(action.type)) {
        // Get user object either from the action or state
        let user = undefined;
        if (action.type === ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS) {
            user = action.user;
        } else if (isLoggedIn(state?.user)) {
            user = state.user;
        }

        if (isDefined(user)) {
            // Required account info modal - takes precedence over stage/exam board re-confirmation modal
            if (isDefined(state.userPreferences) && !allRequiredInformationIsPresent(user, state.userPreferences, user.registeredContexts)) {
                dispatch(openActiveModal(requiredAccountInformationModal));
            }
            // User context re-confirmation modal - used to request a user to update their stage and exam board 
            else if (needToUpdateUserContextDetails(user.registeredContextsLastConfirmed)) {
                dispatch(openActiveModal(userContextReconfirmationModal));
            }
        }
    }

    if (action.type === ACTION_TYPE.QUESTION_ATTEMPT_REQUEST) {
        const lastQuestionId = persistence.session.load(KEY.FIRST_ANON_QUESTION);

        if (lastQuestionId === null) {
            persistence.session.save(KEY.FIRST_ANON_QUESTION, action.questionId);
        } else if (
                state && !isLoggedIn(state.user) &&
                lastQuestionId !== action.questionId &&
                !withinLast2Hours(persistence.load(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME))
            ) {
                dispatch(logAction({
                    type: "LOGIN_MODAL_SHOWN"
                }));
                persistence.session.remove(KEY.FIRST_ANON_QUESTION);
                persistence.save(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(loginOrSignUpModal) as any);
        }
    }

    return dispatch(action);
};
