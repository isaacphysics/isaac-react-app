import { useEffect, useState } from "react";
import { selectors, useAppSelector, useGetGroupsQuery, useGetMySetAssignmentsQuery } from "../state";

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
    const { data: quizzes, isFetching: isFetchingQuizzes } = useGetMySetAssignmentsQuery(undefined);
    const [getStartedTasks, setGetStartedTasks] = useState<GetStartedTasks | undefined>(undefined);

    useEffect(() => {
        if (!isFetchingGroups && !isFetchingQuizzes) {
            setGetStartedTasks({
                createAccount: !!user,
                personaliseContent: !!user?.registeredContexts?.length,
                createGroup: !!groups?.length,
                assignQuiz: !!quizzes?.length,
                // viewMarkbook: false
            });
        }
    }, [groups?.length, isFetchingGroups, isFetchingQuizzes, quizzes?.length, user]);

    return getStartedTasks;
};
