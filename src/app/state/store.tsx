import {applyMiddleware, createStore, compose} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./userConsistencyChecker";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const storeFactory = (initialState: object = {doc: null, questions: []}) => {
    const middleware: any[] = [userConsistencyCheckerMiddleware, thunk];
    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger())
    }

    const enhancer = composeEnhancers(
        applyMiddleware(...middleware)
    );

    return enhancer(createStore)(
        rootReducer,
        initialState
    );
};
