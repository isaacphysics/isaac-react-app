import {api} from "./api";

export const ACTION = {
    DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
    DOCUMENT_REQUEST_SUCCESS: "DOCUMENT_REQUEST_SUCCESS",
    DOCUMENT_REQUEST_FAILURE: "DOCUMENT_REQUEST_FAILURE",

    QUESTION_REGISTRATION: "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION: "QUESTION_DEREGISTRATION",
};

export const fetchQuestion = (questionId: string) => {
    return async (dispatch: any) => {
        dispatch({type: ACTION.DOCUMENT_REQUEST, questionId: questionId});
        try {
            let response = await api.question(questionId);
            dispatch({type: ACTION.DOCUMENT_REQUEST_SUCCESS, doc: response.data});
        } catch (exception) {
            dispatch({type: ACTION.DOCUMENT_REQUEST_FAILURE, questionId: questionId, reason: exception.toString()});
        }
    };
};

export const registerQuestion = (question: object) => {
    return (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_REGISTRATION, question: question});
    }
};

export const deregisterQuestion = (questionId: string) => {
    return (dispatch: any) => {
        dispatch({type: ACTION.QUESTION_DEREGISTRATION, questionId: questionId});
    }
};
