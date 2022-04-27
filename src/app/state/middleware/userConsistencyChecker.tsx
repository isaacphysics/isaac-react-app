import {Action, Dispatch, Middleware, MiddlewareAPI} from "redux";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE} from "../../services/constants";
import {getUserId, setUserId} from "./userConsistencyCheckerCurrentUser";
import {changePage} from "../actions";
import {is2FARequired, api as apiSlice} from "../slices/api";
import {isAnyOf} from "@reduxjs/toolkit";

// Generic log action:
// This is not imported from actions to avoid a circular dependency through store.
export const logAction = (eventDetails: object) => {
    return {type: ACTION_TYPE.LOG_EVENT, eventDetails: eventDetails};
};

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
    const appUserId = state && state.user && state.user._id;
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

const clearCurrentUser = () => {
    clearTimeout(timeoutHandle);
    setUserId(undefined);
    changePage("/");
};

export const userConsistencyCheckerMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    if ((apiSlice.endpoints.login.matchFulfilled(action) && !is2FARequired(action.payload)) || isAnyOf(apiSlice.endpoints.totpChallenge.matchFulfilled, apiSlice.endpoints.currentUser.matchFulfilled)(action)) {
        setCurrentUser(action.payload, api);
    }
    if (isAnyOf(apiSlice.endpoints.logout.matchFulfilled, apiSlice.endpoints.logoutEverywhere.matchFulfilled)(action) || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
        clearCurrentUser();
    }
    return next(action as any);
};
