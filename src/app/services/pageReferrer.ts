import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "./constants";
import * as persistence from "./localStorage";
import {KEY} from "./localStorage";

export const pageReferrerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    const dispatchedActionsResult = await dispatch(action);

    if([ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type)) {
        if (
            action.path.includes("/concept") || action.path.includes("/questions/")
        ) {
            persistence.save(KEY.CONCEPT_PAGE_REFERRER, window.location.href);
        } else {
            persistence.remove(KEY.CONCEPT_PAGE_REFERRER);
        }
    }

    return dispatchedActionsResult;
};
