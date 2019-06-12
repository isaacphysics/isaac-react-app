import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {ACTION_TYPE} from "../services/constants";
import {getUserId, setUserId} from "./userConsistencyCheckerCurrentUser";

let timeoutHandle: number | undefined;

// You might expect the dispatch you get in MiddlewareAPI to be asynchronous. However, it isn't. This makes sense, because
// you can make your own asynchronous one from a synchronous one, but not vice-versa. In these cases, we only want to
// use it asynchronously, so that is what we do.

const scheduleNextCheck = (middleware: MiddlewareAPI) => {
    // @ts-ignore I don't know why Typescript picks up Node for setTimeout and DOM for clearTimeout but it is stupid.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    timeoutHandle = setTimeout(() => checkUserConsistency(middleware), 1000);
};

const checkUserConsistency = (middleware: MiddlewareAPI) => {
    const storedUserId = getUserId();
    const state = middleware.getState();
    const appUserId = state && state.user && state.user._id;
    if (storedUserId != appUserId) {
        // Mark error after this check has finished, else the error will be snuffed by the error reducer.
        setImmediate(() => middleware.dispatch({type: ACTION_TYPE.USER_CONSISTENCY_ERROR}));
    } else {
        scheduleNextCheck(middleware);
    }
};


const setCurrentUser = (user: RegisteredUserDTO, api: MiddlewareAPI) => {
    clearTimeout(timeoutHandle);
    // Only start checking if we can successfully store the user id
    if (setUserId(user._id)) {
        scheduleNextCheck(api);
    }
};

const clearCurrentUser = () => {
    clearTimeout(timeoutHandle);
    setUserId(undefined);
};

export const userConsistencyCheckerMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => action => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_OUT_REQUEST:
            clearCurrentUser();
            break;
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
            setCurrentUser(action.user, api);
            break;
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
            clearCurrentUser();
            break;
    }

    return next(action);
};