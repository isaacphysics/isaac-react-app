import {AnyAction, Middleware} from "redux";
import {ThunkDispatch} from "redux-thunk";
import reduxLogger from "redux-logger";
import {AppState, rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./middleware/userConsistencyChecker";
import {notificationCheckerMiddleware} from "./middleware/notificationManager";
import {configureStore} from "@reduxjs/toolkit";
import {isaacApi} from "./slices/api";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export const middleware: Middleware[] = [
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware,
    isaacApi.middleware
];

export const store = configureStore({
    reducer: rootReducer,
    // [thunk, immutableStateInvariant, serializableStateInvariant] are all in the default middleware and included by default
    // in development, with only thunk included in production.
    // See https://redux-toolkit.js.org/api/getDefaultMiddleware#customizing-the-included-middleware
    middleware: (getDefaultMiddleware) => {
        const newMiddleware = getDefaultMiddleware().concat(middleware);
        // @ts-ignore
        if (process.env.NODE_ENV !== 'production' && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            newMiddleware.concat([reduxLogger]);
        }
        return newMiddleware;
    },
    preloadedState: {},
    devTools: process.env.NODE_ENV !== 'production',
});

// TODO AnyAction should be changed to our Action type, unioned with whatever extra actions types we need, if possible
export type AppDispatch = ThunkDispatch<AppState, never, AnyAction>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
