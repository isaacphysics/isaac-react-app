import {api} from "./api";

export const ACTION = {
    DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
    DOCUMENT_REQUEST_SUCCESS: "DOCUMENT_REQUEST_SUCCESS",
    DOCUMENT_REQUEST_FAILURE: "DOCUMENT_REQUEST_FAILURE"
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
