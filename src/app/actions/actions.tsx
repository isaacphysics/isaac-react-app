export const actionTypes = {
    LOAD_QUESTION: "LOAD_QUESTION"
};

export const loadQuestion = (question: object) => {
    return {
        type: actionTypes.LOAD_QUESTION,
        question: question,
    }
};
