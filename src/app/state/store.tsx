import {AnyAction, applyMiddleware, compose, createStore, Middleware} from "redux";
import thunk, {ThunkDispatch} from "redux-thunk";
import * as reduxLogger from "redux-logger";
import {AppState, rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./userConsistencyChecker";
import {notificationCheckerMiddleware} from "../services/notificationManager";
import {modalFocusMiddleware} from "./modalFocusMiddleware";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const middleware: Middleware[] = [
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware,
    modalFocusMiddleware,
    thunk,
];

const storeFactory = (initialState: object) => {
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        middleware.push(reduxLogger.createLogger());
    }

    const enhancer = composeEnhancers(
        applyMiddleware(...middleware)
    );

    return enhancer(createStore)(
        rootReducer,
        initialState
    );
};

export const store = storeFactory({});
export type AppDispatch = ThunkDispatch<AppState, never, AnyAction>;
