import {applyMiddleware, compose, createStore, Middleware} from "redux";
import thunk from "redux-thunk";
import * as reduxLogger from "redux-logger";
import {rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./userConsistencyChecker";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const storeFactory = (initialState: object) => {
    const middleware: Middleware[] = [
        userConsistencyCheckerMiddleware,
        thunk
    ];
    if (process.env.NODE_ENV !== 'production') {
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
