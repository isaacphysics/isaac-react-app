import {applyMiddleware, compose, createStore, Middleware} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {rootReducer} from "./reducers";
import {userConsistencyCheckerMiddleware} from "./userConsistencyChecker";
import {ACTION_TYPE} from "../services/constants";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const storeFactory = (initialState: object) => {
    const middleware: Middleware[] = [userConsistencyCheckerMiddleware, thunk];
    if (process.env.NODE_ENV !== 'production') {
        const actionTypesToIgnore = [ACTION_TYPE.USER_CONSISTENCY_CHECK];
        middleware.push(createLogger({
            predicate: (getState, action) => !actionTypesToIgnore.includes(action.type)
        }));
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
