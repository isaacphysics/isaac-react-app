import {api} from "../services/api";
import {Dispatch} from "react";
import {Action, ValidatedChoice} from "../../IsaacAppTypes";
import {AuthenticationProvider, ChoiceDTO, QuestionDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {ACTION_TYPES, TOPICS} from "../services/constants";
import {AppState} from "./reducers";
import history from "../services/history";


interface validationUser extends RegisteredUserDTO {
    password: string | null
}


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


export const requestUserPreferences = () => async (dispatch: Dispatch<Action>) => {

};

export const updateCurrentUser = (params: {registeredUser: validationUser; passwordCurrent: string}, currentUser: RegisteredUserDTO) => async (dispatch: Dispatch<Action>) => {
    console.log(params.registeredUser);
    console.log(params.registeredUser.firstLogin);
    if (currentUser.email !== params.registeredUser.email) {
        let emailChange = window.confirm("You have edited your email address. Your current address will continue to work until you verify your new address by following the verification link sent to it via email. Continue?");
        if (!!emailChange) {
            try {
                const changedUser = await api.users.updateCurrent(params);
                dispatch({type: ACTION_TYPES.USER_DETAILS_UPDATE_SUCCESS});
                if (params.registeredUser.firstLogin == true) {
                    history.push('/account');
                } else {
                    history.push('/');
                }
            } catch (e) {
                dispatch({type: ACTION_TYPES.USER_DETAILS_UPDATE_FAILURE, errorMessage: e.response.data.errorMessage});
            }
        } else {
            params.registeredUser.email = currentUser.email;
        }
    } else {
        dispatch({type: ACTION_TYPES.USER_DETAILS_UPDATE});
        try {
            const currentUser = await api.users.updateCurrent(params);
            dispatch({type: ACTION_TYPES.USER_DETAILS_UPDATE_SUCCESS});
            if (params.registeredUser.firstLogin == true) {
                history.push('/account');
            } else {
                history.push('/');
            }
        } catch (e) {
            dispatch({type: ACTION_TYPES.USER_DETAILS_UPDATE_FAILURE, errorMessage: e.response.data.errorMessage});
        }
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const logInUser = (provider: AuthenticationProvider, params: {email: string; password: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_LOG_IN_REQUEST, provider});
    try {
        const response = await api.authentication.login(provider, params);
        dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
        history.push('/');
        history.go(0);
    } catch (e) {
        dispatch({type: ACTION_TYPES.USER_LOG_IN_FAILURE, errorMessage: e.response.data.errorMessage})
    }
};

export const resetPassword = (params: {email: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_PASSWORD_RESET_REQUEST});
    const response = await api.users.passwordReset(params);
    dispatch({type: ACTION_TYPES.USER_PASSWORD_RESET_REQUEST_SUCCESS});
};

export const verifyPasswordReset = (token: string | null) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPES.USER_INCOMING_PASSWORD_RESET_REQUEST});
        const response = await api.users.verifyPasswordReset(token);
        dispatch({type: ACTION_TYPES.USER_INCOMING_PASSWORD_RESET_REQUEST_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPES.USER_INCOMING_PASSWORD_RESET_REQUEST_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const handlePasswordReset = (params: {token: string | null, password: string | null}) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPES.USER_PASSWORD_RESET});
        const response = await api.users.handlePasswordReset(params);
        dispatch({type: ACTION_TYPES.USER_PASSWORD_RESET_SUCCESS});
        history.push('/');
        history.go(0);
    } catch(e) {
        dispatch({type:ACTION_TYPES.USER_INCOMING_PASSWORD_RESET_REQUEST_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};


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

export const handleEmailAlter = (params: ({userId: string | null, token: string | null})) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPES.EMAIL_AUTHENTICATION_REQUEST});
        const response = await api.email.verifyEmail(params);
        dispatch({type: ACTION_TYPES.EMAIL_AUTHENTICATION_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPES.EMAIL_AUTHENTICATION_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

// Constants
export const requestConstantsUnits = () => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Don't request this again if it has already been fetched successfully
    const state = getState();
    if (state && state.constants && state.constants.units) {
        return;
    }

    dispatch({type: ACTION_TYPES.CONSTANTS_UNITS_REQUEST});
    try {
        const units = await api.constants.getUnits();
        dispatch({type: ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_SUCCESS, units: units.data});
    } catch (e) {
        dispatch({type: ACTION_TYPES.CONSTANTS_UNITS_RESPONSE_FAILURE});
    }
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

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO|ValidatedChoice<ChoiceDTO>) => (dispatch: Dispatch<Action>) => {
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
