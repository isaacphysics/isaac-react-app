import {combineReducers} from "redux";
import {ACTION} from "./actions";

const defaultUserState: null = null;
const user = (user: object | null = defaultUserState, action: any) => {
    switch (action.type) {
        case ACTION.USER_LOG_IN_RESPONSE_SUCCESS:
            return {...action.user};
        default:
            return user;
    }
};

const defaultDocState: null = null;
const doc = (doc: object | null = defaultDocState, action: any) => {
    switch (action.type) {
        case ACTION.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
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
        default:
            return questions;
    }
};

const defaultAssignmentsState: null = null;
const assignments = (assignments: object[] | null = defaultAssignmentsState, action: any) => {
    switch (action.type) {
        case ACTION.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

const defaultGameboardState: null = null;
const currentGameboard = (currentGameboard: object | null = defaultGameboardState, action: any) => {
    switch (action.type) {
        case ACTION.GAMEBOARD_RESPONSE_SUCCESS:
            return action.gameboard;
        default:
            return currentGameboard;
    }
};

const appReducer = combineReducers({user, doc, questions, currentGameboard, assignments});

export const rootReducer = (state: any, action: {type: string}) => {
    if (action.type === ACTION.USER_LOG_OUT_RESPONSE_SUCCESS) {
        state = undefined;
    }
    return appReducer(state, action);
};
