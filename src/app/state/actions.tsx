import {api} from "../services/api";
import {Dispatch} from "react";
import {Action, ValidatedChoice, ValidationUser} from "../../IsaacAppTypes";
import {AuthenticationProvider, ChoiceDTO, QuestionDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {ACTION_TYPE, DOCUMENT_TYPE, TAG_ID} from "../services/constants";
import {AppState} from "./reducers";
import history from "../services/history";





// User Authentication
export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_UPDATE_REQUEST});
    try {
        const currentUser = await api.users.getCurrent();
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_UPDATE_FAILURE});
    }
};

export const getUserAuthsettings = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST});
    try {
        const authenticationSettings = await api.authentication.getCurrentUserAuthSettings();
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_SUCCESS, authSettings: authenticationSettings.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};


export const requestUserPreferences = () => async (dispatch: Dispatch<Action>) => {

};

export const updateCurrentUser = (params: {registeredUser: ValidationUser; passwordCurrent: string}, currentUser: RegisteredUserDTO) => async (dispatch: Dispatch<Action>) => {
    if (currentUser.email !== params.registeredUser.email) {
        let emailChange = window.confirm("You have edited your email address. Your current address will continue to work until you verify your new address by following the verification link sent to it via email. Continue?");
        // TODO handle the alert ourselves
        if (!!emailChange) {
            // setUserDetails(params);
            try {
                const currentUser = await api.users.updateCurrent(params);
                dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_SUCCESS});
                history.push('/');
                history.go(0);
            } catch (e) {
                dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_FAILURE, errorMessage: e.response.data.errorMessage});
            }
        } else {
            params.registeredUser.email = currentUser.email;
        }
    } else {
        // setUserDetails(params);
        try {
            const currentUser = await api.users.updateCurrent(params);
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_SUCCESS});
            history.push('/');
            history.go(0);
        } catch (e) {
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_FAILURE, errorMessage: e.response.data.errorMessage});
        }
    }
};

export const setUserDetails = (params: {registeredUser: ValidationUser; passwordCurrent: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE});
    try {
        const currentUser = await api.users.updateCurrent(params);
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_SUCCESS});
        history.push('/');
        history.go(0);
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const logInUser = (provider: AuthenticationProvider, params: {email: string; password: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_IN_REQUEST, provider});
    try {
        const response = await api.authentication.login(provider, params);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
        history.push('/');
        history.go(0);
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_LOG_IN_FAILURE, errorMessage: e.response.data.errorMessage})
    }
};

export const resetPassword = (params: {email: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST});
    const response = await api.users.passwordReset(params);
    dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST_SUCCESS});
};

export const verifyPasswordReset = (token: string | null) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST});
        const response = await api.users.verifyPasswordReset(token);
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const handlePasswordReset = (params: {token: string | null, password: string | null}) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET});
        const response = await api.users.handlePasswordReset(params);
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_SUCCESS});
        history.push('/');
        history.go(0);
    } catch(e) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};


export const handleProviderLoginRedirect = (provider: AuthenticationProvider) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT, provider});
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ACTION_TYPE.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: AuthenticationProvider, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, parameters);
    dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT trigger user consistency check
    // TODO MT handle error case
};

export const handleEmailAlter = (params: ({userId: string | null; token: string | null})) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.EMAIL_AUTHENTICATION_REQUEST});
        const response = await api.email.verify(params);
        dispatch({type: ACTION_TYPE.EMAIL_AUTHENTICATION_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPE.EMAIL_AUTHENTICATION_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

// Constants
export const requestConstantsUnits = () => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Don't request this again if it has already been fetched successfully
    const state = getState();
    if (state && state.constants && state.constants.units) {
        return;
    }

    dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_REQUEST});
    try {
        const units = await api.constants.getUnits();
        dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS, units: units.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_FAILURE});
    }
};


// Concepts
export const fetchConcept = (conceptId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.DOCUMENT_REQUEST, documentType: DOCUMENT_TYPE.CONCEPT, documentId: conceptId});
    const response = await api.concepts.get(conceptId);
    dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};


// Questions
export const fetchQuestion = (questionId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.DOCUMENT_REQUEST, documentType: DOCUMENT_TYPE.QUESTION, documentId: questionId});
    const response = await api.questions.get(questionId);
    dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};

export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO|ValidatedChoice<ChoiceDTO>) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};


// Topic
export const fetchTopicDetails = (topicName: TAG_ID) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.TOPIC_REQUEST, topicName});
    try {
        // could check local storage first
        const topicDetailResponse = await api.topics.get(topicName);
        dispatch({type: ACTION_TYPE.TOPIC_RESPONSE_SUCCESS, topic: topicDetailResponse.data});
    } catch (e) {
        //dispatch({type: ACTION_TYPE.TOPIC_RESPONSE_FAILURE}); // TODO MT handle response failure
    }
};


// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};


// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};
