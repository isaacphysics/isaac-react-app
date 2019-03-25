import {combineReducers} from "redux";
import {ACTION} from "./actions";

const defaultUserState: null = null;
const user = (user: object | null = defaultUserState, action: any) => {
    switch (action.type) {
        case ACTION.USER_LOG_IN:
            return {...action.user};
        case ACTION.USER_LOG_OUT:
            return defaultUserState;
        default:
            return user;
    }
};

const defaultDocState: null = null;
const doc = (doc: object | null = defaultDocState, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        case ACTION.USER_LOG_OUT:
            return defaultDocState;
        default:
            return doc;
    }
};

const defaultQuestionsState: [] = [];
const questions = (questions: any[] = defaultQuestionsState, action: any) => {
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
        case ACTION.USER_LOG_OUT:
            return defaultQuestionsState;
        default:
            return questions;
    }
};

const defaultAssignmentsState: null = null;
const assignments = (assignments: object[] | null = defaultAssignmentsState, action: any) => {
    switch (action.type) {
        case ACTION.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION.USER_LOG_OUT:
            return defaultAssignmentsState;
        default:
            return assignments;
    }
};

export const rootReducer = combineReducers({user, doc, questions, assignments});
