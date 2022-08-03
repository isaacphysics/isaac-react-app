import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE} from "../../services/constants";
import {isDefined} from "../../services/miscUtils";
import {logAction, changePage, getUserId, setUserId} from "../index";

let timeoutHandle: number | undefined;

// You might expect the dispatch you get in MiddlewareAPI to be asynchronous. However, it isn't. This makes sense, because
// you can make your own asynchronous one from a synchronous one, but not vice-versa. In these cases, we only want to
// use it asynchronously, so that is what we do.

const scheduleNextCheck = (middleware: MiddlewareAPI) => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    timeoutHandle = window.setTimeout(() => checkUserConsistency(middleware), 1000);
};

const checkUserConsistency = (middleware: MiddlewareAPI) => {
    const storedUserId = getUserId();
    const state = middleware.getState();
    const appUserId = state?.user?._id;
    if (storedUserId != appUserId) {
        middleware.dispatch(logAction({type: "USER_CONSISTENCY_WARNING_SHOWN", userAgent: navigator.userAgent}));
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
    } else {
        // eslint-disable-next-line no-console
        console.error("Cannot perform user consistency checking!");
        const eventDetails = {
            type: "USER_CONSISTENCY_CHECKING_FAILED",
            userAgent: navigator.userAgent,
        };
        api.dispatch(logAction(eventDetails));
    }
};

function clearCurrentUser(redirectHome: boolean) {
    if (isDefined(timeoutHandle)) {
        clearTimeout(timeoutHandle);
    }
    setUserId(undefined);
    if (redirectHome) {
        changePage("/");
    }
}

export const userConsistencyCheckerMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => action => {
    switch (action.type) {
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
        case ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS:
        case ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS:
            clearCurrentUser(true);
            break;
        case ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE:
            // If the current user request returns an error we assume the user is not logged in.
            // We should therefore, remove any data in local and session storage that might be related to the user.
            // We do not redirect to the homepage as that would happen to anonymous users after following any hard link.
            clearCurrentUser(false);
            break;
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
        case ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS:
            setCurrentUser(action.user, api);
            break;
    }

    return next(action);
};
