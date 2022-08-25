import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {
    ACTION_TYPE,
    allRequiredInformationIsPresent,
    isLoggedIn,
    KEY,
    persistence,
    withinLast2Hours,
    withinLast50Minutes
} from "../../services";
import {Action} from "../../../IsaacAppTypes";
import {logAction, needToUpdateUserContextDetails, openActiveModal, routerPageChange} from "../index";
import {requiredAccountInformationModal} from "../../components/elements/modals/RequiredAccountInformationModal";
import {loginOrSignUpModal} from "../../components/elements/modals/LoginOrSignUpModal";
import {userContextReconfimationModal} from "../../components/elements/modals/UserContextReconfirmationModal";

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {

    const state = middlewareApi.getState();
    if([ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, routerPageChange.type].includes(action.type)) {
        if (state && isLoggedIn(state.user)) {
            // Required account info modal - takes precedence over stage/exam board re-confirmation modal, and is only
            // shown once every 50 minutes (using a key in clients browser storage)
            if (!allRequiredInformationIsPresent(state.user, state.userPreferences, state.user.registeredContexts) &&
                !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))) {
                persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(requiredAccountInformationModal));
            }
            // User context re-confirmation modal - used to request a user to update their stage and/or exam board
            // once every academic year.
            else if (needToUpdateUserContextDetails(state.user.registeredContextsLastConfirmed) &&
                     !withinLast50Minutes(persistence.load(KEY.RECONFIRM_USER_CONTEXT_SHOWN_TIME))) {
                persistence.save(KEY.RECONFIRM_USER_CONTEXT_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(userContextReconfimationModal));
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
