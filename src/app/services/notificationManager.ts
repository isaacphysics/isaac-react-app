import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import {openActiveModal} from "../state/actions";
import {userPreferencesModal} from "../components/elements/UserPreferencesModal";
import {validateEmailPreferences} from "./validation";

function emailPreferencesAreNotSet(userPreferences: UserPreferencesDTO | null) {
    const emailPreferencesOrNull = userPreferences && userPreferences.EMAIL_PREFERENCE || null;
    return !validateEmailPreferences(emailPreferencesOrNull);
}

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    await dispatch(action);

    const state = middlewareApi.getState();
    if([ACTION_TYPE.USER_UPDATE_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        // User email preferences check - runs after dispatching the action as we clear the modal on page change
        if (state.user && state.user.loggedIn === true && emailPreferencesAreNotSet(state.userPreferences)) {
            dispatch(openActiveModal(userPreferencesModal));
        }
    }
};
