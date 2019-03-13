import {actionTypes} from "../actions/actions";
import {combineReducers} from "redux";

export const question = (state: object = {}, action: {type: string, question: object}) => {
    switch (action.type) {
        case actionTypes.RECEIVE_QUESTION:
            return {...action.question};
        default:
            return state;
    }
};

export const rootReducer = combineReducers({question});
