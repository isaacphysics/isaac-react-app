import {combineReducers} from "redux";
import {Action, ActionType, AppQuestionDTO} from "../../IsaacAppTypes";
import {AssignmentDTO, ContentDTO, GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";

type UserState = RegisteredUserDTO | null;
const user = (user: UserState = null, action: Action) => {
    switch (action.type) {
        case ActionType.USER_LOG_IN_RESPONSE_SUCCESS:
            return {...action.user};
        default:
            return user;
    }
};

type DocState = ContentDTO | null;
const doc = (doc: DocState = null, action: Action) => {
    switch (action.type) {
        case ActionType.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        default:
            return doc;
    }
};

const question = (question: AppQuestionDTO, action: Action) => {
    switch (action.type) {
        case ActionType.QUESTION_SET_CURRENT_ATTEMPT:
            return {...question, currentAttempt: action.attempt, canSubmit: true};
        case ActionType.QUESTION_ATTEMPT_REQUEST:
            return {...question, canSubmit: false};
        case ActionType.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return (!question.bestAttempt || !question.bestAttempt.correct) ?
                {...question, validationResponse: action.response, bestAttempt: action.response} :
                {...question, validationResponse: action.response};
        default:
            return question
    }
};

type QuestionsState = AppQuestionDTO[] | null;
const questions = (questions: QuestionsState = null, action: Action) => {
    switch (action.type) {
        case ActionType.QUESTION_REGISTRATION:
            const currentQuestions = questions !== null ? [...questions] : [];
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer} :
                action.question;
            return [...currentQuestions, newQuestion];

        case ActionType.QUESTION_DEREGISTRATION:
            const filteredQuestions = questions && questions.filter((q) => q.id != action.questionId);
            return filteredQuestions && filteredQuestions.length ? filteredQuestions : null;

        // Delegate processing the question matching action.questionId to the question reducer
        case ActionType.QUESTION_SET_CURRENT_ATTEMPT:
        case ActionType.QUESTION_ATTEMPT_REQUEST:
        case ActionType.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return questions && questions.map((q) => q.id === action.questionId ? question(q, action) : q);

        default:
            return questions;
    }
};

type AssignmentsState = AssignmentDTO[] | null;
const assignments = (assignments: AssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ActionType.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

type CurrentGameboardState = GameboardDTO | null;
const currentGameboard = (currentGameboard: CurrentGameboardState = null, action: Action) => {
    switch (action.type) {
        case ActionType.GAMEBOARD_RESPONSE_SUCCESS:
            return action.gameboard;
        default:
            return currentGameboard;
    }
};

const appReducer = combineReducers({user, doc, questions, currentGameboard, assignments});


export type AppState = undefined | {
    user: UserState,
    doc: DocState,
    questions: QuestionsState,
    currentGameboard: CurrentGameboardState,
    assignments: AssignmentsState
}

export const rootReducer = (state: AppState, action: {type: string}) => {
    if (action.type === ActionType.USER_LOG_OUT_RESPONSE_SUCCESS) {
        state = undefined;
    }
    return appReducer(state, action);
};
