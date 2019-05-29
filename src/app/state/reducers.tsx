import {combineReducers} from "redux";
import {Action, AppQuestionDTO, isValidatedChoice, LoggedInUser, UserPreferencesDTO} from "../../IsaacAppTypes";
import {
    AssignmentDTO,
    ContentDTO,
    ContentSummaryDTO,
    GameboardDTO,
    IsaacTopicSummaryPageDTO,
    ResultsWrapper,
    UserAuthenticationSettingsDTO
} from "../../IsaacApiTypes";
import {ACTION_TYPE, ContentVersionUpdatingStatus} from "../services/constants";

type UserState = LoggedInUser | null;
export const user = (user: UserState = null, action: Action): UserState => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
            return {loggedIn: true, ...action.user};
        case ACTION_TYPE.USER_UPDATE_FAILURE:
        case ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS:
            return {loggedIn: false};
        default:
            return user;
    }
};

type UserAuthSettingsState = UserAuthenticationSettingsDTO | null;
export const userAuthSettings = (userAuthSettings: UserAuthSettingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_AUTH_SETTINGS_SUCCESS:
            return action.userAuthSettings;
        default:
            return userAuthSettings;
    }
};

type UserPreferencesState = UserPreferencesDTO | null;
export const userPreferences = (userPreferences: UserPreferencesState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_PREFERENCES_SUCCESS:
            return action.userPreferences;
        default:
            return userPreferences;
    }
};


type ConstantsState = {units?: string[]; segueVersion?: string} | null;
export const constants = (constants: ConstantsState = null, action: Action): ConstantsState => {
    switch (action.type) {
        case ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS:
            return {...constants, units: action.units};
        case ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS:
            return {...constants, segueVersion: action.segueVersion};
        default:
            return constants;
    }
};

type DocState = ContentDTO | null;
export const doc = (doc: DocState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.DOCUMENT_REQUEST:
            return null;
        case ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS:
        case ACTION_TYPE.DOCUMENT_CACHE_SUCCESS:
            return {...action.doc};
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return doc;
    }
};

export const question = (question: AppQuestionDTO, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
            if (isValidatedChoice(action.attempt)) {
                return {...question, currentAttempt: action.attempt.choice, canSubmit: action.attempt.frontEndValidation, validationResponse: null};
            } else {
                return {...question, currentAttempt: action.attempt, canSubmit: true, validationResponse: null};
            }
        case ACTION_TYPE.QUESTION_ATTEMPT_REQUEST:
            return {...question, canSubmit: false};
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
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
        case ACTION_TYPE.QUESTION_REGISTRATION: {
            const currentQuestions = questions !== null ? [...questions] : [];
            const bestAttempt = action.question.bestAttempt;
            const newQuestion = bestAttempt ?
                {...action.question, validationResponse: bestAttempt, currentAttempt: bestAttempt.answer} :
                action.question;
            return [...currentQuestions, newQuestion];
        }
        case ACTION_TYPE.QUESTION_DEREGISTRATION: {
            const filteredQuestions = questions && questions.filter((q) => q.id != action.questionId);
            return filteredQuestions && filteredQuestions.length ? filteredQuestions : null;
        }
        // Delegate processing the question matching action.questionId to the question reducer
        case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
        case ACTION_TYPE.QUESTION_ATTEMPT_REQUEST:
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS: {
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
        case ACTION_TYPE.ASSIGNMENTS_REQUEST:
            return null;
        case ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        default:
            return assignments;
    }
};

type CurrentGameboardState = GameboardDTO | null;
export const currentGameboard = (currentGameboard: CurrentGameboardState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GAMEBOARD_REQUEST:
            return null;
        case ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS:
            return action.gameboard;
        default:
            return currentGameboard;
    }
};

export type CurrentTopicState = IsaacTopicSummaryPageDTO | null;
export const currentTopic = (currentTopic: CurrentTopicState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.TOPIC_REQUEST:
            return null;
        case ACTION_TYPE.TOPIC_RESPONSE_SUCCESS:
        case ACTION_TYPE.TOPIC_CACHE_SUCCESS:
            return action.topic;
        default:
            return currentTopic;
    }
};

export type ErrorState = {type: "generalError"; generalError: string} | {type: "consistencyError"} | null;
export const error = (error: ErrorState = null, action: Action): ErrorState => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_IN_FAILURE:
        case ACTION_TYPE.USER_DETAILS_UPDATE_FAILURE:
        case ACTION_TYPE.EMAIL_AUTHENTICATION_FAILURE:
        case ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST_FAILURE:
        case ACTION_TYPE.USER_PASSWORD_RESET_FAILURE:
        case ACTION_TYPE.USER_AUTH_SETTINGS_FAILURE:
        case ACTION_TYPE.USER_PREFERENCES_FAILURE:
            return {type: "generalError", generalError: action.errorMessage};
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
            return {type: "consistencyError"};
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return error;
    }
};

type SearchState = {searchResults: ResultsWrapper<ContentSummaryDTO> | null} | null;
export const search = (search: SearchState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.SEARCH_REQUEST:
            return {...search, searchResults: null};
        case ACTION_TYPE.SEARCH_RESPONSE_SUCCESS:
            return {...search, searchResults: action.searchResults};
        default:
            return search;
    }
};

export type ContentVersionState = {liveVersion?: string; updateState?: ContentVersionUpdatingStatus; updatingVersion?: string} | null;
export const contentVersion = (contentVersion: ContentVersionState = null, action: Action): ContentVersionState => {
    switch (action.type) {
        case ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS:
            return {...contentVersion, liveVersion: action.liveVersion};
        case ACTION_TYPE.CONTENT_VERSION_SET_REQUEST:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.UPDATING, updatingVersion: action.version};
        case ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_SUCCESS:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.SUCCESS, liveVersion: action.newVersion};
        case ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE:
            return {...contentVersion, updateState: ContentVersionUpdatingStatus.FAILURE};
        default:
            return contentVersion;
    }
};


const appReducer = combineReducers({
    user,
    userAuthSettings,
    userPreferences,
    constants,
    doc,
    questions,
    currentTopic,
    currentGameboard,
    assignments,
    contentVersion,
    search,
    error,
});

export type AppState = undefined | {
    user: UserState;
    userAuthSettings: UserAuthSettingsState;
    userPreferences: UserPreferencesState;
    doc: DocState;
    questions: QuestionsState;
    currentTopic: CurrentTopicState;
    currentGameboard: CurrentGameboardState;
    assignments: AssignmentsState;
    contentVersion: ContentVersionState;
    search: SearchState;
    constants: ConstantsState;
    error: ErrorState;
}

export const rootReducer = (state: AppState, action: Action) => {
    if (action.type === ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
        state = undefined;
    }
    return appReducer(state, action);
};
