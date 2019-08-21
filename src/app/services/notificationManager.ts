import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import {openActiveModal} from "../state/actions";
import {userPreferencesModal} from "../components/elements/UserPreferencesModal";
import {validateEmailPreferences, withinLast50Minutes} from "./validation";
import {AppState} from "../state/reducers";
import {isLoggedIn} from "./user";
import * as persistence from "./localStorage";
import {KEY} from "./localStorage";

function emailPreferencesAreNotSet(userPreferences: UserPreferencesDTO | null) {
    const emailPreferencesOrNull = userPreferences && userPreferences.EMAIL_PREFERENCE || null;
    return !validateEmailPreferences(emailPreferencesOrNull);
}

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    const dispatchedActionsResult = await dispatch(action);

    const state: AppState = middlewareApi.getState();
    if([ACTION_TYPE.USER_UPDATE_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        if (
            state && isLoggedIn(state.user) && emailPreferencesAreNotSet(state.userPreferences) &&
            !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))
        ) {
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
            await dispatch(openActiveModal(userPreferencesModal) as any);
        }
    }

    return dispatchedActionsResult;
};
