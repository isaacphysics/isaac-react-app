import {useEffect, useMemo, useState} from "react";
import {
    AppDispatch,
    assignmentsApi,
    deregisterQuestions,
    getRTKQueryErrorMessage,
    mutationSucceeded,
    quizApi,
    registerQuestions,
    selectors,
    showErrorToast,
    showRTKQueryErrorToastIfNeeded,
    showSuccessToast,
    useAppDispatch,
    useAppSelector,
    useGetAvailableQuizzesQuery,
    useGetMyQuizAttemptWithFeedbackQuery,
    useGetStudentQuizAttemptWithFeedbackQuery
} from "../state";
import {
    API_PATH,
    getValue,
    isDefined,
    isEventLeaderOrStaff,
    isQuestion,
    Item,
    matchesAllWordsInAnyOrder,
    tags,
    toTuple,
    useQueryParams
} from "./";
import {
    ContentDTO,
    IsaacQuizSectionDTO,
    QuestionDTO,
    QuizAssignmentDTO,
    QuizAttemptDTO,
    QuizFeedbackMode,
    QuizSummaryDTO,
    RegisteredUserDTO,
    UserSummaryDTO
} from "../../IsaacApiTypes";
import partition from "lodash/partition";
import {skipToken} from "@reduxjs/toolkit/query";
import {createAsyncThunk} from "@reduxjs/toolkit";

export interface QuizSpec {
    quizId: string;
    groups: Item<number>[];
    dueDate?: Date;
    scheduledStartDate?: Date;
    quizFeedbackMode?: QuizFeedbackMode;
    userId?: number;
}

export const assignMultipleQuiz = createAsyncThunk(
    "quiz/assignQuiz",
    async (
        {quizId, groups, dueDate, scheduledStartDate, quizFeedbackMode, userId}: QuizSpec,
        {dispatch, rejectWithValue}
    ) => {
        const appDispatch = dispatch as AppDispatch;

        const groupIds = groups.map(getValue);
        const quizzes: QuizAssignmentDTO[] = groupIds.map(id => ({
            quizId: quizId,
            groupId: id,
            dueDate: dueDate,
            scheduledStartDate: scheduledStartDate,
            quizFeedbackMode: quizFeedbackMode
        }));

        const response = await dispatch(quizApi.endpoints.assignQuiz.initiate(quizzes));
        if (mutationSucceeded(response)) {
            const groupLookUp = new Map(groups.map(toTuple));
            const quizStatuses = response.data;
            const newQuizAssignments: QuizAssignmentDTO[] = quizStatuses.filter(q => isDefined(q.assignmentId)).map(q => ({
                id: q.assignmentId as number,
                groupId: q.groupId,
                quizId: quizId,
                // FIXME see gameboard.ts [96:17] about timestamps
                creationDate: (new Date()).valueOf() as unknown as Date,
                dueDate: dueDate?.valueOf() as unknown as Date | undefined,
                scheduledStartDate: scheduledStartDate?.valueOf() as unknown as Date | undefined,
                ownerUserId: userId,
            }));
            const successfulIds = newQuizAssignments.map(q => q.groupId);
            const failedIds = quizStatuses.filter(q => isDefined(q.errorMessage));
            if (failedIds.length === 0) {
                appDispatch(showSuccessToast(
                    `Test${successfulIds.length > 1 ? "s" : ""} assigned`,
                    `${successfulIds.length > 1 ? "All tests have" : "This test has"} been saved successfully`
                ));
            } else {
                // Show each group assignment error in a separate toast
                failedIds.forEach(({groupId, errorMessage}) => {
                    appDispatch(showErrorToast(
                        `Test assignment to ${groupLookUp.get(groupId) ?? "unknown group"} failed`,
                        errorMessage as string
                    ));
                });
                // Check whether some group assignments succeeded, if so show "partial success" toast
                if (failedIds.length === quizStatuses.length) {
                    return rejectWithValue(null);
                } else {
                    const partialSuccessMessage = `${successfulIds.length > 1
                            ? "Some tests were saved successfully."
                            : `Test assigned to ${groupLookUp.get(successfulIds[0] as number)} was saved successfully.`}`;
                    appDispatch(showSuccessToast(
                        `Test${successfulIds.length > 1 ? "s" : ""} saved`,
                        partialSuccessMessage
                    ));
                }
            }
            appDispatch(quizApi.util.updateQueryData(
                "getQuizAssignmentsSetByMe",
                undefined,
                (quizzesByMe) => quizzesByMe.concat(newQuizAssignments)
            ));
            successfulIds.forEach(groupId => {
                appDispatch(assignmentsApi.util.updateQueryData(
                   "getMySetAssignments",
                    groupId,
                    (quizzesByMe => quizzesByMe.concat(
                        newQuizAssignments.filter(q => q.groupId === groupId)
                    ))
                ));
            });
            return newQuizAssignments;
        } else {
            appDispatch(showRTKQueryErrorToastIfNeeded(
                `Test assignment${groups.length > 1 ? "(s)" : ""} failed`,
                response
            ));
            return rejectWithValue(null);
        }
    }
);

export function extractQuestions(doc: ContentDTO | undefined): QuestionDTO[] {
    const qs: QuestionDTO[] = [];

    function walk(doc: ContentDTO) {
        if (isDefined(doc)) {
            if (isQuestion(doc)) {
                qs.push(doc as QuestionDTO);
            } else {
                if (doc.children) {
                    doc.children.forEach((c) => walk(c));
                }
            }
        }
    }

    if (doc) {
        walk(doc);
    }
    return qs;
}

export function useQuizQuestions(attempt?: QuizAttemptDTO) {
    return useMemo(() => {
        return extractQuestions(attempt?.quiz);
    }, [attempt?.quiz]);
}

export function useQuizSections(attempt?: QuizAttemptDTO) {
    return useMemo(() => {
        const sections: { [id: string]: IsaacQuizSectionDTO } = {};
        attempt?.quiz?.children?.forEach(section => {
            sections[section.id as string] = section as IsaacQuizSectionDTO;
        });
        return sections;
    }, [attempt?.quiz]);
}

export function useFilteredQuizzes(user: RegisteredUserDTO) {
    const [filteredQuizzes, setFilteredQuizzes] = useState<Array<QuizSummaryDTO> | undefined>();
    const {filter}: {filter?: string} = useQueryParams(true);
    const [titleFilter, setTitleFilter] = useState<string|undefined>(filter?.replace(/[^a-zA-Z0-9 ]+/g, ''));
    const {data: quizzes} = useGetAvailableQuizzesQuery(0);

    useEffect(() => {
        if (isDefined(titleFilter) && isDefined(quizzes)) {
            const results = quizzes
                .filter(quiz => matchesAllWordsInAnyOrder(quiz.title, titleFilter))
                .filter(quiz => isEventLeaderOrStaff(user) || (quiz.hiddenFromRoles ? !quiz.hiddenFromRoles?.includes("TEACHER") : true));

            if (isDefined(results) && results.length > 0) {
                setFilteredQuizzes(results);
            } else {
                setFilteredQuizzes([]);
            }
            return; // Ugly but works...
        }
        setFilteredQuizzes(quizzes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titleFilter, quizzes]);

    return {titleFilter, setTitleFilter, filteredQuizzes};
}

export function useQuizAttemptFeedback(quizAttemptId: number | undefined, quizAssignmentId: number | undefined, studentId: number | undefined) {
    const myQuizAttemptKey = quizAttemptId && !isDefined(studentId) ? quizAttemptId : skipToken;
    const {data: currentUserAttempt, error: currentUserError} = useGetMyQuizAttemptWithFeedbackQuery(myQuizAttemptKey);

    const studentQuizAttemptQueryKey = studentId && quizAssignmentId ? {userId: studentId, quizAssignmentId} : skipToken;
    const {data: studentAttemptAndUser, error: studentError} = useGetStudentQuizAttemptWithFeedbackQuery(studentQuizAttemptQueryKey);

    // If we have a student id, then we're look at the attempt for a given student
    const [attempt, error] = studentId
        ? [studentAttemptAndUser?.attempt, studentError ? getRTKQueryErrorMessage(studentError)?.message : undefined]
        : [currentUserAttempt, currentUserError ? getRTKQueryErrorMessage(currentUserError)?.message : undefined];

    // Augment quiz object with subject id, propagating undefined-ness
    // WARNING: This useMemo stops an infinite loop of re-renders - this is because when a quiz question attempt
    // changes, this causes the quiz attempt to change, but that causes the quiz question attempt to change again, etc.
    const attemptWithQuizSubject = useMemo(() => {
        return attempt
            ? {...attempt, quiz: attempt?.quiz && tags.augmentDocWithSubject(attempt.quiz)}
            : undefined;
    }, [attempt]);

    const questions = useQuizQuestions(attemptWithQuizSubject);
    const sections = useQuizSections(attemptWithQuizSubject);

    const dispatch = useAppDispatch();
    useEffect( () => {
        if (!isDefined(questions) || questions.length === 0) return;
        // All register questions does is store the questions in redux WITH SOME EXTRA CALCULATED STRUCTURE
        dispatch(registerQuestions(questions, undefined, true));
        return () => dispatch(deregisterQuestions(questions.map(q => q.id as string)));
    }, [dispatch, questions]);

    return {attempt: attemptWithQuizSubject, error, studentUser: studentAttemptAndUser?.user, questions, sections};
}

export function useCurrentQuizAttempt() {
    const currentUserAttemptState = useAppSelector(selectors.quizzes.currentQuizAttempt);
    const [attempt, error] = useMemo(() => {
        if (!isDefined(currentUserAttemptState)) return [];
        return [
            'attempt' in currentUserAttemptState ? currentUserAttemptState.attempt : undefined,
            'error' in currentUserAttemptState ? currentUserAttemptState.error : undefined
        ];
    }, [currentUserAttemptState]);

    // Augment quiz object with subject id, propagating undefined-ness
    // WARNING: This useMemo stops an infinite loop of re-renders - this is because when a quiz question attempt
    // changes, this causes the quiz attempt to change, but that causes the quiz question attempt to change again, etc.
    const attemptWithQuizSubject = useMemo(() => {
        return attempt
            ? {...attempt, quiz: attempt?.quiz && tags.augmentDocWithSubject(attempt.quiz)}
            : undefined;
    }, [attempt]);

    const questions = useQuizQuestions(attemptWithQuizSubject);
    const sections = useQuizSections(attemptWithQuizSubject);

    const dispatch = useAppDispatch();
    useEffect( () => {
        if (!isDefined(questions) || questions.length === 0) return;
        // All register questions does is store the questions in redux WITH SOME EXTRA CALCULATED STRUCTURE
        dispatch(registerQuestions(questions, undefined, true));
        return () => dispatch(deregisterQuestions(questions.map(q => q.id as string)));
    }, [dispatch, questions]);

    return {attempt: attemptWithQuizSubject, error, questions, sections};
}

export function getQuizAssignmentCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/quiz/assignment/${assignmentId}/download`;
}

// type QuizAttemptOrAssignment = (QuizAttemptDTO | QuizAssignmentDTO);

// export function isAttempt(a: QuizAttemptOrAssignment): a is QuizAttemptDTO {
//     return !('groupId' in a);
// }

// export function partitionCompleteAndIncompleteQuizzes(assignmentsAndAttempts: QuizAssignmentDTO[]): [QuizAssignmentDTO[], QuizAssignmentDTO[]];
// export function partitionCompleteAndIncompleteQuizzes(assignmentsAndAttempts: QuizAttemptOrAssignment[]): [QuizAttemptOrAssignment[], QuizAttemptOrAssignment[]] {
//     return partition(assignmentsAndAttempts, a => isDefined(isAttempt(a) ? a.completedDate : a.attempt?.completedDate));
// }

export function partitionCompleteAndIncompleteQuizzes(assignmentsAndAttempts: QuizAssignmentDTO[]): [QuizAssignmentDTO[], QuizAssignmentDTO[]] {
    return partition(assignmentsAndAttempts, a => isDefined(a.attempt?.completedDate));
}

export enum QuizStatus {
    Overdue, NotStarted, Started, Complete
}

const todaysDate = new Date(new Date().setHours(0, 0, 0, 0));

// Assigned quizzes (QuizAssignmentDTO) and single attempts at practice quizzes (QuizAttemptDTO) are considered the same thing for display purposes
export interface DisplayableQuiz {
    id: string | number;
    isAssigned: boolean;
    title?: string;
    creationDate?: Date;
    startDate?: Date;
    setDate?: Date;
    dueDate?: Date;
    completedDate?: Date;
    attempt?: QuizAttemptDTO;
    assignerSummary?: UserSummaryDTO;
    quizFeedbackMode?: QuizFeedbackMode;
    link?: string;
    status?: QuizStatus;
};

export function convertAssignmentToQuiz(assignment: QuizAssignmentDTO): DisplayableQuiz | undefined {
    if (!assignment.id) {
        return undefined;
    }
    const status = assignment.attempt?.completedDate ? QuizStatus.Complete
        : (assignment.dueDate && todaysDate > assignment.dueDate) ? QuizStatus.Overdue
            : (assignment.attempt) ? QuizStatus.Started 
                : QuizStatus.NotStarted;

    return {
        id: assignment.id,
        isAssigned: true,
        title: assignment.quizSummary?.title,
        creationDate: assignment.creationDate,
        setDate: assignment.scheduledStartDate,
        startDate: assignment.attempt?.startDate,
        dueDate: assignment.dueDate,
        completedDate: assignment.attempt?.completedDate,
        attempt: assignment.attempt,
        quizFeedbackMode: assignment.quizFeedbackMode,
        assignerSummary: assignment.assignerSummary,
        link: status === QuizStatus.Complete ? (assignment.quizFeedbackMode !== "NONE" ? `/test/attempt/${assignment.attempt?.id}/feedback` : undefined)
            : status === QuizStatus.Overdue ? undefined
                : `/test/assignment/${assignment.id}`,
        status: status
    };
}

export function convertAttemptToQuiz(attempt: QuizAttemptDTO): DisplayableQuiz | undefined {
    if (!attempt.id) {
        return undefined;
    }
    return {
        id: attempt.id,
        isAssigned: false,
        title: attempt.quizSummary?.title,
        startDate: attempt.startDate,
        completedDate: attempt.completedDate,
        attempt: attempt,
        quizFeedbackMode: attempt.feedbackMode,
        link: attempt.completedDate ? `/test/attempt/${attempt.id}/feedback` : `/test/attempt/${attempt.id}`,
        status: attempt.completedDate ? QuizStatus.Complete : QuizStatus.Started,
    };
}
