import {ACTION} from "./actions";
import {combineReducers} from "redux";

export const doc = (docState: object | null = null, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        default:
            return docState;
    }
};

export const questions = (questionsState: any[] = [], action: any) => {
    switch (action.type) {
        case ACTION.QUESTION_REGISTRATION:
            return [...questionsState, action.question];
        case ACTION.QUESTION_DEREGISTRATION:
            return questionsState.filter((question) => question.id == action.questionId);
        case ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return questionsState.map((question) => {
                return question.id == action.questionId ? {...question, validationResponse: action.response} : question;
            });
        default:
            return questionsState;
    }
};

export const rootReducer = combineReducers({doc, questions});
