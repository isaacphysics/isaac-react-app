import {api} from "../services/api";

export const ACTION = {
    DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS: "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE: "DOCUMENT_RESPONSE_FAILURE",

    QUESTION_REGISTRATION: "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION: "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST: "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS: "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE: "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_SET_CURRENT_ATTEMPT: "QUESTION_SET_CURRENT_ATTEMPT",

    USER_UPDATE: "USER_UPDATE",
};

export const fetchQuestion = (questionId: string) =>
    async (dispatch: any) => {
        dispatch({type: ACTION.DOCUMENT_REQUEST, questionId});
        const response = await api.questions.get(questionId);
        dispatch({type: ACTION.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
        // TODO MT handle response failure
    };

export const registerQuestion = (question: object) =>
    (dispatch: any) =>
        dispatch({type: ACTION.QUESTION_REGISTRATION, question});

export const deregisterQuestion = (questionId: string) =>
    (dispatch: any) =>
        dispatch({type: ACTION.QUESTION_DEREGISTRATION, questionId});

export const attemptQuestion = (questionId: string, attempt: object) =>
    async (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
        const response = await api.questions.answer(questionId, attempt);
        dispatch({type: ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
        // TODO MT handle response failure timed canSubmit
    };

export const setCurrentAttempt = (questionId: string, attempt: object) =>
    (dispatch: any) =>
        dispatch({type: ACTION.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});

export const requestCurrentUser = () =>
    async (dispatch: any) => {
        try {
            const currentUser = await api.users.getCurrent();// Needs to be async....
            if (currentUser.data) {
                dispatch({type: ACTION.USER_UPDATE, user: currentUser.data});
                // TODO MT handle periodic check etc
            }
        } catch (exception) {
            console.log("Caught exception", exception);
        }
    };
