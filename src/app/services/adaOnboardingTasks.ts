interface GetStartedTasks {
    createAccount: boolean;
    personaliseContent: boolean; // set teaching level / exam board
    createGroup: boolean;
    assignQuiz: boolean;
    viewMarkbook: boolean;
}

export const useAdaGetStartedTasks = () : GetStartedTasks => {
    // TODO: implement logic

    return {
        createAccount: true,
        personaliseContent: false,
        createGroup: false,
        assignQuiz: false,
        viewMarkbook: false
    };
};
