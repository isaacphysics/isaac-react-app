import {api} from "./api";

export const ACTION = {
    DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS: "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE: "DOCUMENT_RESPONSE_FAILURE",

    QUESTION_REGISTRATION: "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION: "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST: "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS: "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE: "QUESTION_ATTEMPT_RESPONSE_FAILURE",
};

export const fetchQuestion = (questionId: string) => {
    return async (dispatch: any) => {
        dispatch({type: ACTION.DOCUMENT_REQUEST, questionId});
        let response = await api.questions.get(questionId);
        dispatch({type: ACTION.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
        // TODO MT handle response failure
    };
};

export const registerQuestion = (question: object) => {
    return (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_REGISTRATION, question});
    };
};

export const deregisterQuestion = (questionId: string) => {
    return (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_DEREGISTRATION, questionId});
    };
};

export const attemptQuestion = (questionId: string, attempt: object) => {
    return async (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
        let response = await api.questions.answer(questionId, attempt);
        dispatch({type: ACTION.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
        // TODO MT handle response failure
    };
};


