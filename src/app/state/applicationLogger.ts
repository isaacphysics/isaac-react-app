import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../services/constants";
import {api} from "../services/api";

export const applicationLoggerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (next: Dispatch) => action => {

    // Can get access to the entire current redux state by calling middlewareApi.getState() if needed.

    switch (action.type) {
        case ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS:
            api.logger.log({type: "VIEW_MY_ASSIGNMENTS"});
            break;

        case ACTION_TYPE.ACCEPT_COOKIES:
            api.logger.log({type: "ACCEPT_COOKIES"});
            break;
    }

    return next(action);

};
