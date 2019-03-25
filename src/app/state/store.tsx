import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import {rootReducer} from "./reducers";

export const storeFactory = (initialState: object = {doc: null, questions: []}) => {
    const middleware: any[] = [thunk];
    if (process.env.NODE_ENV !== 'production') {
        middleware.push(createLogger())
    }
    return applyMiddleware(...middleware)(createStore)(
        rootReducer,
        initialState
    );
};
