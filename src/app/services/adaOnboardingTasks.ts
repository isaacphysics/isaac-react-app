import { selectors, useAppSelector, useGetGroupsQuery, useGetQuizAssignmentsSetByMeQuery } from "../state";

interface GetStartedTasks {
    createAccount: boolean;
    personaliseContent: boolean; // set teaching level / exam board
    createGroup: boolean;
    assignQuiz: boolean;
    // viewMarkbook: boolean;
}

export const useAdaGetStartedTasks = () : GetStartedTasks | undefined => {

    const user = useAppSelector(selectors.user.loggedInOrNull);
    const { data: groups, isFetching: isFetchingGroups } = useGetGroupsQuery(false);
    const { data: quizzes, isFetching: isFetchingQuizzes } = useGetQuizAssignmentsSetByMeQuery();

    if (isFetchingGroups || isFetchingQuizzes) {
        return undefined;
    }

    return {
        createAccount: !!user,
        personaliseContent: !!user?.registeredContexts?.length,
        createGroup: !!groups?.length,
        assignQuiz: !!quizzes?.length,
        // viewMarkbook: false
    };
};
