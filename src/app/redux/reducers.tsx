import {ACTION} from "./actions";
import {combineReducers} from "redux";

export const doc = (docState: object | null = null, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_REQUEST_SUCCESS:
            return {...action.doc};
        default:
            return docState;
    }
};

export const rootReducer = combineReducers({doc});
