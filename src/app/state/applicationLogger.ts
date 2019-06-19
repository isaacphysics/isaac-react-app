import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../services/constants";
import {api} from "../services/api";

export const applicationLoggerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (next: Dispatch) => action => {

    // Can get access to the entire current redux state by calling middlewareApi.getState() if needed.

    switch (action.type) {
        case ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS:
            api.logger.log({type: "VIEW_MY_ASSIGNMENTS"});
            break;

        // For generic log events:
        case ACTION_TYPE.LOG_EVENT:
            api.logger.log(action.eventDetails);
            break;
    }

    return next(action);

};
