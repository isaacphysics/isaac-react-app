import {useEffect, useMemo, useState} from "react";
import {
    deregisterQuestions,
    getRTKQueryErrorMessage,
    registerQuestions,
    selectors,
    useAppDispatch,
    useAppSelector,
    useGetStudentQuizAttemptWithFeedbackQuery,
    useGetAvailableQuizzesQuery, useGetMyQuizAttemptWithFeedbackQuery
} from "../state";
import {API_PATH, isDefined, isEventLeaderOrStaff, isQuestion, matchesAllWordsInAnyOrder, tags, useQueryParams} from "./";
import {
    ContentDTO,
    IsaacQuizSectionDTO,
    QuestionDTO,
    QuizAssignmentDTO,
    QuizAttemptDTO,
    QuizSummaryDTO,
    RegisteredUserDTO
} from "../../IsaacApiTypes";
import partition from "lodash/partition";
import {skipToken} from "@reduxjs/toolkit/query";

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
    const {filter}: {filter?: string} = useQueryParams();
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

type QuizAttemptOrAssignment = (QuizAttemptDTO | QuizAssignmentDTO);

export function isAttempt(a: QuizAttemptOrAssignment): a is QuizAttemptDTO {
    return !('groupId' in a);
}

export function partitionCompleteAndIncompleteQuizzes(assignmentsAndAttempts: QuizAttemptOrAssignment[]): [QuizAttemptOrAssignment[], QuizAttemptOrAssignment[]] {
    return partition(assignmentsAndAttempts, a => isDefined(isAttempt(a) ? a.completedDate : a.attempt?.completedDate))
}
