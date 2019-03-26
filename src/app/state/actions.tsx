import {api} from "../services/api";

export const ACTION = {
    USER_UPDATE_REQUEST: "USER_UPDATE_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS: "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_OUT_REQUEST: "USER_LOG_OUT_REQUEST",
    USER_LOG_OUT_RESPONSE_SUCCESS: "USER_LOG_OUT_RESPONSE_SUCCESS",

    AUTHENTICATION_REQUEST_REDIRECT: "AUTHENTICATION_REQUEST_REDIRECT",
    AUTHENTICATION_REDIRECT: "AUTHENTICATION_REDIRECT",
    AUTHENTICATION_HANDLE_CALLBACK: "AUTHENTICATION_HANDLE_CALLBACK",

    DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS: "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE: "DOCUMENT_RESPONSE_FAILURE",

    QUESTION_REGISTRATION: "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION: "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST: "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS: "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE: "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_SET_CURRENT_ATTEMPT: "QUESTION_SET_CURRENT_ATTEMPT",

    GAMEBOARD_REQUEST: "GAMEBOARD_REQUEST",
    GAMEBOARD_RESPONSE_SUCCESS: "GAMEBOARD_RESPONSE_SUCCESS",

    ASSIGNMENTS_REQUEST: "ASSIGNMENTS_REQUEST",
    ASSIGNMENTS_RESPONSE_SUCCESS: "ASSIGNMENTS_RESPONSE_SUCCESS",
};


// User Authentication
export const requestCurrentUser = () => async (dispatch: any) => {
    dispatch({type: ACTION.USER_UPDATE_REQUEST});
    const currentUser = await api.users.getCurrent();
    dispatch({type: ACTION.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    // TODO MT handle error case properly
};

export const logOutUser = () => async (dispatch: any) => {
    dispatch({type: ACTION.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ACTION.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const handleProviderLoginRedirect = (provider: string) => async (dispatch: any) => {
    dispatch({type: ACTION.AUTHENTICATION_REQUEST_REDIRECT, provider});
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ACTION.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
};

export const handleProviderCallback = (provider: string, paramaters: string) => async (dispatch: any) => {
    dispatch({type: ACTION.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, paramaters);
    dispatch({type: ACTION.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT trigger user consistency check
    // TODO MT handle error case
};


// Questions
export const fetchQuestion = (questionId: string) => async (dispatch: any) => {
    dispatch({type: ACTION.DOCUMENT_REQUEST, questionId});
    const response = await api.questions.get(questionId);
    dispatch({type: ACTION.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};

export const registerQuestion = (question: object) => (dispatch: any) => {
    dispatch({type: ACTION.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: any) => {
    dispatch({type: ACTION.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: object) => async (dispatch: any) => {
    dispatch({type: ACTION.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: object) => (dispatch: any) => {
    dispatch({type: ACTION.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};


// Current Gameboard
export const loadGameboard = (gameboardId: string | null) => async (dispatch: any) => {
    dispatch({type: ACTION.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ACTION.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};


// Assignments
export const loadMyAssignments = () => async (dispatch: any) => {
    dispatch({type: ACTION.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};
