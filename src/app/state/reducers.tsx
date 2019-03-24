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
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, currentAttempt: bestAttempt.answer, validationResponse: bestAttempt} :
                action.question;
            return [...questions, newQuestion];
        case ACTION.QUESTION_DEREGISTRATION:
            return questions.filter((question) => question.id != action.questionId);

        case ACTION.QUESTION_SET_CURRENT_ATTEMPT:
            return questions.map((question) =>
                question.id == action.questionId ?
                    {...question, currentAttempt: action.attempt, canSubmit: true} :
                    question
            );

        case ACTION.QUESTION_ATTEMPT_REQUEST:
            return questions.map((question) =>
                question.id == action.questionId ?
                    {...question, canSubmit: false} :
                    question
            );
        case ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return questions.map((question) => {
                if (question.id == action.questionId) {
                    return (!question.bestAttempt || !question.bestAttempt.correct) ?
                        {...question, validationResponse: action.response, bestAttempt: action.response} :
                        {...question, validationResponse: action.response};
                } else {
                    return question;
                }
            });

        default:
            return questions;
    }
};

export const rootReducer = combineReducers({doc, questions});
