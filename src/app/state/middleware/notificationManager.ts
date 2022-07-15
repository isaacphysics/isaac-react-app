import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../../services/constants";
import {Action, LoggedInUser} from "../../../IsaacAppTypes";
import {logAction, openActiveModal} from "../actions";
import {allRequiredInformationIsPresent, withinLast2Hours, withinLast50Minutes} from "../../services/validation";
import {isLoggedIn} from "../../services/user";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {requiredAccountInformationModal} from "../../components/elements/modals/RequiredAccountInformationModal";
import {loginOrSignUpModal} from "../../components/elements/modals/LoginOrSignUpModal";
import {userContextReconfimationModal} from "../../components/elements/modals/UserContextReconfirmationModal";

// Returns true if the user hasn't updated their stage, exam board and school since *last August*,
// and it's at least the 24th of August
const needToUpdateUserContextDetails = (user: LoggedInUser) => {
    // First calculate when the last August before today was...
    let date = new Date();
    if (date.getMonth() < 8) {
        date.setFullYear(date.getFullYear() - 1);
    }
    date.setMonth(8, 1);
    date.setHours(0, 0, 0, 0);
    // Date is now the 1st day of last August
    if (user.registeredContextsLastConfirmed && user.registeredContextsLastConfirmed < date) {
        date.setDate(24);
        // Date is now the 24th of last August (the last week of August, give or take)
        if (Date.now() > date.valueOf()) {
            return true;
        }
    }
    return false;
}

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {

    const state = middlewareApi.getState();
    if([ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        if (state && isLoggedIn(state.user)) {
            // Required account info model - takes precedence over stage/exam board re-confirmation modal, only
            // shown once every 50 minutes (using a key in clients browser storage)
            if (!allRequiredInformationIsPresent(state.user, state.userPreferences, state.user.registeredContexts) &&
                !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))) {
                persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(requiredAccountInformationModal));
            }
            // User context re-confirmation modal - used to request a user to update their stage and/or exam board
            // once every academic year.
            else if (needToUpdateUserContextDetails(state.user) &&
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
