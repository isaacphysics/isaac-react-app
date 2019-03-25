import {combineReducers} from "redux";
import {ACTION} from "./actions";

const user = (user: object | null = null, action: any) => {
    switch (action.type) {
        case ACTION.USER_LOG_IN:
            return {...action.user};
        case ACTION.USER_LOG_OUT:
            return null;
        default:
            return user;
    }
};

const doc = (doc: object | null = null, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        default:
            return doc;
    }
};

const questions = (questions: any[] = [], action: any) => {
    switch (action.type) {
        case ACTION.QUESTION_REGISTRATION:
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer} :
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

const assignments = (assignments: object[] | null = null, action: any) => {
    switch (action.type) {
        case ACTION.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

export const rootReducer = combineReducers({user, doc, questions, assignments});
