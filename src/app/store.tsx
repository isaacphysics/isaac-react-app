import {applyMiddleware, createStore} from "redux";
import {rootReducer} from "./reducers/reducers";
import thunk from "redux-thunk";

export const storeFactory = (initialState: object = {question: {}}) => {
    return applyMiddleware(thunk)(createStore)(
        rootReducer,
        initialState
    );
};
