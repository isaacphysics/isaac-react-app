import {applyMiddleware, createStore, Middleware} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {rootReducer} from "./reducers";

const storeFactory = (initialState: object) => {
    const middleware: Middleware[] = [thunk];
    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger())
    }
    return applyMiddleware(...middleware)(createStore)(
        rootReducer,
        initialState
    );
};

export const store = storeFactory({});
