import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import {openActiveModal} from "../state/actions";
import {userPreferencesModal} from "../components/elements/UserPreferencesModal";

function emailPreferencesAreNotSet(userPreferences: UserPreferencesDTO | null) {
    const emailPreferencesIfDefined = userPreferences && userPreferences.EMAIL_PREFERENCE;
    return !(
        emailPreferencesIfDefined &&
        emailPreferencesIfDefined.NEWS_AND_UPDATES !== undefined &&
        emailPreferencesIfDefined.ASSIGNMENTS !== undefined &&
        emailPreferencesIfDefined.EVENTS !== undefined
    );
}

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    await dispatch(action);

    const state = middlewareApi.getState();
    if([ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        // User email preferences check - runs after dispatching the action as we clear the modal on page change
        if (state.user && state.user.loggedIn === true && emailPreferencesAreNotSet(state.userPreferences)) {
            dispatch(openActiveModal(userPreferencesModal(state.userPreferences)));
        }
    }
};
