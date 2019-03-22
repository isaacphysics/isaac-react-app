import {ACTION} from "./actions";
import {combineReducers} from "redux";

export const doc = (doc: object | null = null, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        default:
            return doc;
    }
};

export const questions = (questions: any[] = [], action: any) => {
    switch (action.type) {
        case ACTION.QUESTION_REGISTRATION:
            // TODO MT handle bestAttempt for validation response and currentAttempt
            return [...questions, {...action.question}];
        case ACTION.QUESTION_DEREGISTRATION:
            return questions.filter((question) => question.id == action.questionId);
        case ACTION.QUESTION_ATTEMPT_REQUEST:
            return questions.map((question) =>
                question.id == action.questionId ?
                    {...question, canSubmit: false} :
                    question
            );
        case ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return questions.map((question) =>
                question.id == action.questionId ?
                    {...question, validationResponse: action.response} :
                    question
            );
        case ACTION.QUESTION_SET_CURRENT_ATTEMPT:
            return questions.map((question) =>
                question.id == action.questionId ?
                    {...question, currentAttempt: action.attempt, canSubmit: true} :
                    question
            );
        default:
            return questions;
    }
};

export const rootReducer = combineReducers({doc, questions});
