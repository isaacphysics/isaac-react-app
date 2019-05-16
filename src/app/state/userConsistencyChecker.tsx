import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {ACTION_TYPE} from "../services/constants";
import {getUserId, setUserId} from "./userConsistencyCheckerCurrentUser";

let timeoutHandle: number | undefined;

// You might expect the dispatch you get in MiddlewareAPI to be asynchronous. However, it isn't. This makes sense, because
// you can make your own asynchronous one from a synchronous one, but not vice-versa. In these cases, we only want to
// use it asynchronously, so that is what we do.

const scheduleNextCheck = (dispatch: Dispatch) => {
    // @ts-ignore I don't know why Typescript picks up Node for setTimeout and DOM for clearTimeout but it is stupid.
    timeoutHandle = setTimeout(() => dispatch({type: ACTION_TYPE.USER_CONSISTENCY_CHECK}), 1000);
};

const checkUserConsistency = ({getState, dispatch}: MiddlewareAPI) => {
    const storedUserId = getUserId();
    const state = getState();
    const appUserId = state && state.user && state.user._id;
    if (storedUserId != appUserId) {
        // Mark error after this check has finished, else the error will be snuffed by the error reducer.
        setImmediate(() => dispatch({type: ACTION_TYPE.USER_CONSISTENCY_ERROR}));
    } else {
        scheduleNextCheck(dispatch);
    }
};

const setCurrentUser = (user: RegisteredUserDTO, api: MiddlewareAPI) => {
    setUserId(user._id);
    clearTimeout(timeoutHandle);
    scheduleNextCheck(api.dispatch);
};

const clearCurrentUser = () => {
    clearTimeout(timeoutHandle);
    setUserId(null);
};

export const userConsistencyCheckerMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => action => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_OUT_REQUEST:
            clearCurrentUser();
            break;
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
            setCurrentUser(action.user, api);
            break;
        case ACTION_TYPE.USER_CONSISTENCY_CHECK:
            checkUserConsistency(api);
            break;
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
            clearCurrentUser();
            break;
    }

    return next(action);
};