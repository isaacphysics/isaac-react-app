import {api} from "../api";

export const actionTypes = {
    REQUEST_QUESTION: "REQUEST_QUESTION",
    RECEIVE_QUESTION: "RECEIVE_QUESTION"
};

const requestQuestion = (questionId: string): object => ({
    type: actionTypes.REQUEST_QUESTION,
    questionId: questionId
});

const receiveQuestion = (question: object): object => ({
    type: actionTypes.RECEIVE_QUESTION,
    question: question,
});

export const fetchQuestion = (questionId: string) => {
    return (dispatch: any) => {
        dispatch(requestQuestion(questionId));
        return api.question(questionId)
            .then(response => dispatch(receiveQuestion(response.data)));
    };
};
