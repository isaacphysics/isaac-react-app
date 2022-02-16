import {AnyAction, applyMiddleware, compose, createStore, Middleware} from "redux";
import thunk, {ThunkDispatch} from "redux-thunk";
import reduxLogger from "redux-logger";
import {AppState, rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./userConsistencyChecker";
import {notificationCheckerMiddleware} from "../services/notificationManager";
import {glossaryTermsAPI} from "./slices/api";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const middleware: Middleware[] = [
    glossaryTermsAPI.middleware,
    userConsistencyCheckerMiddleware,
    notificationCheckerMiddleware,
    thunk,
];

const storeFactory = (initialState: object) => {
    // @ts-ignore
    if (process.env.NODE_ENV !== 'production' && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        middleware.push(reduxLogger);
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


/*
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        const newMiddleware = getDefaultMiddleware().concat(middleware).concat(glossaryTermsAPI.middleware);
        // @ts-ignore
        if (process.env.NODE_ENV !== 'production' && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            newMiddleware.push(logger);
        }
        return newMiddleware;
    },
    preloadedState: {},
    devTools: process.env.NODE_ENV !== 'production',
});
 */