import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import {LoggedInUser, UserPreferencesDTO} from "../../IsaacAppTypes";
import {openActiveModal} from "../state/actions";
import {requiredAccountInformationModal} from "../components/elements/RequiredAccountInformationModal";
import {validateEmailPreferences} from "./validation";
import {isLoggedIn} from "./user";


function requiredInformationIsPresent(user: LoggedInUser, userPreferences: UserPreferencesDTO) {
    return validateEmailPreferences(userPreferences.EMAIL_PREFERENCE);
}

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    await dispatch(action);

    const state = middlewareApi.getState();
    if([ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        // Required account information check - runs after dispatching the action as we clear the modal on page change
        if (isLoggedIn(state.user) && !requiredInformationIsPresent(state.user, state.userPreferences)) {
            dispatch(openActiveModal(requiredAccountInformationModal));
        }
    }
};
