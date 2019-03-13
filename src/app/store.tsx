import {applyMiddleware, createStore} from "redux";
import {rootReducer} from "./reducers/reducers";

export const storeFactory = (initialState: object = {question: {}}) => {
    return applyMiddleware()(createStore)(
        rootReducer,
        initialState
    );
};
