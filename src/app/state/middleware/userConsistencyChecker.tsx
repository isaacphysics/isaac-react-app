import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE, isDefined, trackEvent} from "../../services";
import {AppDispatch, changePage, getUserId, logAction, redirectTo, setUserId} from "../index";
import {setAfterRenewPath} from "../../services/useSessionExpired";
import { Action } from "../../../IsaacAppTypes";
import {Immutable} from "immer";

let timeoutHandle: number | undefined;

// You might expect the dispatch you get in MiddlewareAPI to be asynchronous. However, it isn't. This makes sense, because
// you can make your own asynchronous one from a synchronous one, but not vice-versa. In these cases, we only want to
// use it asynchronously, so that is what we do.

const scheduleNextCheck = (middleware: MiddlewareAPI) => {
    timeoutHandle = window.setTimeout(() => checkUserConsistency(middleware), 1000);
};

const checkUserConsistency = (middleware: MiddlewareAPI) => {
    const storedUserId = getUserId();
    const state = middleware.getState();
    const dispatch = middleware.dispatch as AppDispatch;
    const appUserId = state?.user?.id;
    if (storedUserId != appUserId) {
        dispatch(logAction({type: "USER_CONSISTENCY_WARNING_SHOWN", userAgent: navigator.userAgent}));
        // Mark error after this check has finished, else the error will be snuffed by the error reducer.
        window.setTimeout(() => middleware.dispatch({type: ACTION_TYPE.USER_CONSISTENCY_ERROR}));
    } else if (state?.user?.sessionExpiry && state.user.sessionExpiry - Date.now() <= 0) {
        window.setTimeout(() => middleware.dispatch({type: ACTION_TYPE.USER_SESSION_EXPIRED}));
    } else {
        scheduleNextCheck(middleware);
    }
};


const setCurrentUser = (user: RegisteredUserDTO | Immutable<RegisteredUserDTO>, api: MiddlewareAPI) => {
    clearTimeout(timeoutHandle);
    // Only start checking if we can successfully store the user id
    if (setUserId(user.id)) {
        scheduleNextCheck(api);
    } else {
        console.error("Cannot perform user consistency checking!");
        trackEvent("exception", { props: { description: "user_consistency_checking_failed", fatal: false }});
    }
};

function clearCurrentUser() {
    if (isDefined(timeoutHandle)) {
        clearTimeout(timeoutHandle);
    }
    setUserId(undefined);
}

// This is where we handle clearing the store on logout and when the user is logged out elsewhere. We do this by
// hard redirecting to the homepage (or the session expired page) which will cause the Redux store to be cleared.
export const userConsistencyCheckerMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    let redirect: string | undefined;
    switch (action.type) {
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
            redirect = "/consistency-error";
            clearCurrentUser();
            setAfterRenewPath();
            // Pushing this history item here causes the page to reload before the redirect below, but this prevents the
            // back button from using stale data:
            changePage(redirect);
            break;
        case ACTION_TYPE.USER_SESSION_EXPIRED:
            redirect = "/error_expired";
            clearCurrentUser();
            setAfterRenewPath();
            changePage(redirect);
            break;
        case ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS:
        case ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS:
            redirect = "/";
            clearCurrentUser();
            break;
        case ACTION_TYPE.USER_DELETION_RESPONSE_SUCCESS:
            redirect = "/deleteaccount/success";
            clearCurrentUser();
            break;
        case ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE:
            // If the current user request returns an error we assume the user is not logged in.
            // We should therefore, remove any data in local and session storage that might be related to the user.
            // We do not redirect to the homepage as that would happen to anonymous users after following any hard link.
            clearCurrentUser();
            break;
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
            if (action.authResponse && "id" in action.authResponse) {
                setCurrentUser(action.authResponse, api);
            }
            break;
        case ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS:
            setCurrentUser(action.user, api);
            break;
    }

    const result = next(action);

    if (redirect) {
        // Redirect after action has been processed so that the notificationManager sees a logged-out user when deciding
        // whether to show the "required fields" modal and recording that in local storage.
        // TODO this might not be the case anymore since this is now a hard redirect now.
        redirectTo(window.location.origin + redirect);
    }

    return result;
};
