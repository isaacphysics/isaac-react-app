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

const question = (question: any, action: any) => {
    switch (action.type) {
        case ACTION.QUESTION_SET_CURRENT_ATTEMPT:
            return {...question, currentAttempt: action.attempt, canSubmit: true};
        case ACTION.QUESTION_ATTEMPT_REQUEST:
            return {...question, canSubmit: false};
        case ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return (!question.bestAttempt || !question.bestAttempt.correct) ?
                {...question, validationResponse: action.response, bestAttempt: action.response} :
                {...question, validationResponse: action.response};
        default:
            return question
    }
};

const questions = (questions: any[] | null = null, action: any) => {
    switch (action.type) {
        case ACTION.QUESTION_REGISTRATION:
            const currentQuestions = questions !== null ? [...questions] : [];
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer} :
                action.question;
            return [...currentQuestions, newQuestion];

        case ACTION.QUESTION_DEREGISTRATION:
            const filteredQuestions = questions && questions.filter((q) => q.id != action.questionId);
            return filteredQuestions && filteredQuestions.length ? filteredQuestions : null;

        // Delegate processing the question matching action.questionId to the question reducer
        case ACTION.QUESTION_SET_CURRENT_ATTEMPT:
        case ACTION.QUESTION_ATTEMPT_REQUEST:
        case ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return questions && questions.map((q) => q.id === action.questionId ? question(q, action) : q);

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

const currentGameboard = (currentGameboard: object | null = null, action: any) => {
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
