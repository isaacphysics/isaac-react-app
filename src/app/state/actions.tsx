import {api} from "../services/api";
import {Dispatch} from "react";
import {Action} from "../../IsaacAppTypes";
import {AuthenticationProvider, ChoiceDTO, QuestionDTO} from "../../IsaacApiTypes";
import {ACTION_TYPES, TOPICS} from "../services/constants";
import history from "../services/history";


// User Authentication
export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_UPDATE_REQUEST});
    try {
        const currentUser = await api.users.getCurrent();
        dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    } catch (e) {
        dispatch({type: ACTION_TYPES.USER_UPDATE_FAILURE});
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const logInUser = (provider: AuthenticationProvider, params: {email: string, password: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_LOG_IN_REQUEST});
    const response = await api.authentication.login(provider, params);
    dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    history.push('/');
    history.go(0);
    // TODO handle error case
}

export const handleProviderLoginRedirect = (provider: AuthenticationProvider) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.AUTHENTICATION_REQUEST_REDIRECT, provider});
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ACTION_TYPES.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: AuthenticationProvider, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, parameters);
    dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT trigger user consistency check
    // TODO MT handle error case
};


// Questions
export const fetchQuestion = (questionId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.DOCUMENT_REQUEST, questionId});
    const response = await api.questions.get(questionId);
    dispatch({type: ACTION_TYPES.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};

export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};


// Topic
export const fetchTopicDetails = (topicName: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.TOPIC_REQUEST, topicName});
    try {
        // could check local storage first
        // const topicDetailResponse = await api.topics.get(topicName);
        dispatch({type: ACTION_TYPES.TOPIC_RESPONSE_SUCCESS, topic: TOPICS[topicName]});
    } catch (e) {
        //dispatch({type: ACTION_TYPES.TOPIC_RESPONSE_FAILURE}); // TODO MT handle response failure
    }
};


// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ACTION_TYPES.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};


// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION_TYPES.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};
