import {Middleware} from "redux";
import reduxLogger from "redux-logger";
import {AppState, rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./middleware/userConsistencyChecker";
import {notificationCheckerMiddleware} from "./middleware/notificationManager";
import {api} from "./slices/api";
import {configureStore} from "@reduxjs/toolkit";

export const middleware: Middleware[] = [
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware,
    api.middleware,
];

// The typing of `configureStore` and `store.dispatch` doesn't take into account any middleware, most importantly that of thunk,
// which is why `any` is required in the second generic argument of `configureStore` here.
export const store = configureStore<AppState, any, Middleware<AppState>[]>({
    reducer: rootReducer,
    // [thunk, immutableStateInvariant, serializableStateInvariant] are all in the default middleware and included by default
    // in development, with only thunk included in production.
    // See https://redux-toolkit.js.org/api/getDefaultMiddleware#customizing-the-included-middleware
    middleware: (getDefaultMiddleware) => {
        const newMiddleware = getDefaultMiddleware().concat(middleware);
        // @ts-ignore
        if (process.env.NODE_ENV !== 'production' && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            newMiddleware.push(reduxLogger);
        }
        return newMiddleware;
    },
    preloadedState: {},
    devTools: process.env.NODE_ENV !== 'production',
});

export type AppDispatch = typeof store.dispatch;