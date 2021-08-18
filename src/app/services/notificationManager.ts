import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import {openActiveModal} from "../state/actions";
import {allRequiredInformationIsPresent, withinLast50Minutes} from "./validation";
import {isLoggedIn} from "./user";
import * as persistence from "./localStorage";
import {KEY} from "./localStorage";
import {requiredAccountInformationModal} from "../components/elements/modals/RequiredAccountInformationModal";

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    const dispatchedActionsResult = await dispatch(action);

    const state = middlewareApi.getState();
    if([ACTION_TYPE.USER_UPDATE_RESPONSE_SUCCESS, ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        if (
            state && isLoggedIn(state.user) &&
            !allRequiredInformationIsPresent(state.user, state.userPreferences, [/*TODO MT*/]) &&
            !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))
        ) {
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
            await dispatch(openActiveModal(requiredAccountInformationModal) as any);
        }
    }

    return dispatchedActionsResult;
};
