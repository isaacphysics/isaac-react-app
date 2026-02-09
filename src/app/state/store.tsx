import {Middleware} from "redux";
import reduxLogger from "redux-logger";
import {
    AppState,
    isaacApi,
    rootReducer,
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware,
    hidePreviousQuestionAttemptMiddleware
} from "./";
import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export const middleware: Middleware[] = [
    isaacApi.middleware,
    hidePreviousQuestionAttemptMiddleware,
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware
];
const defaultMiddlewareOptions = {
    // serializableCheck: process.env.NODE_ENV !== 'test',
    // Make local dev actually responsive?
    serializableCheck: false,
    immutableCheck: false,
};

export const store = configureStore({
    reducer: rootReducer,
    // [thunk, immutableStateInvariant, serializableStateInvariant] are all in the default middleware and included by default
    // in development, with only thunk included in production.
    // See https://redux-toolkit.js.org/api/getDefaultMiddleware#customizing-the-included-middleware
    middleware: (getDefaultMiddleware) => {
        const newMiddleware = getDefaultMiddleware(defaultMiddlewareOptions).concat(middleware);
        // @ts-ignore
        if (!['production', 'test'].includes(process.env.NODE_ENV) && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            // newMiddleware.concat([reduxLogger]);
            newMiddleware.push(reduxLogger as Middleware);
        }
        return newMiddleware;
    },
    preloadedState: {},
    devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
