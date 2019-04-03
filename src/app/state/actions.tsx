import {api} from "../services/api";
import {Dispatch} from "react";
import {Action, ActionType} from "../../IsaacAppTypes";
import {ChoiceDTO, QuestionDTO} from "../../IsaacApiTypes";

// User Authentication
export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.USER_UPDATE_REQUEST});
    const currentUser = await api.users.getCurrent();
    dispatch({type: ActionType.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    // TODO MT handle error case properly
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ActionType.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const handleProviderLoginRedirect = (provider: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.AUTHENTICATION_REQUEST_REDIRECT, provider});
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ActionType.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
};

export const handleProviderCallback = (provider: string, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, parameters);
    dispatch({type: ActionType.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT trigger user consistency check
    // TODO MT handle error case
};


// Questions
export const fetchQuestion = (questionId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.DOCUMENT_REQUEST, questionId});
    const response = await api.questions.get(questionId);
    dispatch({type: ActionType.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};

export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ActionType.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};


// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ActionType.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};


// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ActionType.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ActionType.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};
