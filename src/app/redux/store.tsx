import {applyMiddleware, createStore} from "redux";
import {rootReducer} from "./reducers";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";

export const storeFactory = (initialState: object = {doc: {}}) => {
    const middleware: any[] = [thunk];
    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger())
    }
    return applyMiddleware(...middleware)(createStore)(
        rootReducer,
        initialState
    );
};
