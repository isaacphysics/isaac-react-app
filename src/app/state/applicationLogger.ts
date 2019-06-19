import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../services/constants";
import {api} from "../services/api";

export const applicationLoggerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (next: Dispatch) => action => {

    // Can get access to the entire current redux state by calling middlewareApi.getState() if needed.

    // TODO: do we even need this middleware if all log events are of type LOG_EVENT and use one action?

    switch (action.type) {
        // For generic log events:
        case ACTION_TYPE.LOG_EVENT:
            api.logger.log(action.eventDetails);
            break;
    }

    return next(action);

};
