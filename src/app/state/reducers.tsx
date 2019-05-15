import {combineReducers} from "redux";
import {Action, AppQuestionDTO, isValidatedChoice, TopicDTO} from "../../IsaacAppTypes";
import {AssignmentDTO, ContentDTO, GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {ACTION_TYPES} from "../services/constants";

type UserState = RegisteredUserDTO | null;
export const user = (user: UserState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS:
            return {...action.user};
        default:
            return user;
    }
};

type ConstantsState = {units: string[]} | null;
export const constants = (constants: ConstantsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_SUCCESS:
            return {...constants, units: action.units};
        default:
            return constants;
    }
};

type DocState = ContentDTO | null;
export const doc = (doc: DocState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.DOCUMENT_RESPONSE_SUCCESS:
            return {...action.doc};
        default:
            return doc;
    }
};

export const question = (question: AppQuestionDTO, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.QUESTION_SET_CURRENT_ATTEMPT:
            if (isValidatedChoice(action.attempt)) {
                return {...question, currentAttempt: action.attempt.choice, canSubmit: action.attempt.frontEndValidation, validationResponse: null};
            } else {
                return {...question, currentAttempt: action.attempt, canSubmit: true, validationResponse: null};
            }
        case ACTION_TYPES.QUESTION_ATTEMPT_REQUEST:
            return {...question, canSubmit: false};
        case ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            return (!question.bestAttempt || !question.bestAttempt.correct) ?
                {...question, validationResponse: action.response, bestAttempt: action.response} :
                {...question, validationResponse: action.response};
        default:
            return question
    }
};

type QuestionsState = AppQuestionDTO[] | null;
export const questions = (questions: QuestionsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.QUESTION_REGISTRATION: {
            const currentQuestions = questions !== null ? [...questions] : [];
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer} :
                action.question;
            return [...currentQuestions, newQuestion];
        }
        case ACTION_TYPES.QUESTION_DEREGISTRATION: {
            const filteredQuestions = questions && questions.filter((q) => q.id != action.questionId);
            return filteredQuestions && filteredQuestions.length ? filteredQuestions : null;
        }
        // Delegate processing the question matching action.questionId to the question reducer
        case ACTION_TYPES.QUESTION_SET_CURRENT_ATTEMPT:
        case ACTION_TYPES.QUESTION_ATTEMPT_REQUEST:
        case ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_SUCCESS: {
            return questions && questions.map((q) => q.id === action.questionId ? question(q, action) : q);
        }
        default: {
            return questions;
        }
    }
};

type AssignmentsState = AssignmentDTO[] | null;
export const assignments = (assignments: AssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

type CurrentGameboardState = GameboardDTO | null;
export const currentGameboard = (currentGameboard: CurrentGameboardState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.GAMEBOARD_RESPONSE_SUCCESS:
            return action.gameboard;
        default:
            return currentGameboard;
    }
};

type CurrentTopicState = TopicDTO | null;
export const currentTopic = (currentTopic: CurrentTopicState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.TOPIC_RESPONSE_SUCCESS:
            return action.topic;
        default:
            return currentTopic;
    }
};

type LoginErrorState = string | null;
export const error = (error: LoginErrorState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPES.USER_LOG_IN_FAILURE:
            return action.errorMessage;
        default:
            return null;
    }
};

const appReducer = combineReducers({
    user,
    constants,
    doc,
    questions,
    currentTopic,
    currentGameboard,
    assignments,
    error
});

export type AppState = undefined | {
    user: UserState;
    constants: ConstantsState;
    doc: DocState;
    questions: QuestionsState;
    currentTopic: CurrentTopicState;
    currentGameboard: CurrentGameboardState;
    assignments: AssignmentsState;
    error: LoginErrorState;
}

export const rootReducer = (state: AppState, action: Action) => {
    if (action.type === ACTION_TYPES.USER_LOG_OUT_RESPONSE_SUCCESS) {
        state = undefined;
    }
    return appReducer(state, action);
};
