import {useEffect, useMemo, useState} from "react";
import {deregisterQuestions, loadQuizzes, registerQuestions, selectors, useAppDispatch, useAppSelector} from "../state";
import {API_PATH, isDefined, isEventLeaderOrStaff, isQuestion, useQueryParams} from "./";
import {
    ContentDTO,
    IsaacQuizSectionDTO,
    QuestionDTO,
    QuizAssignmentDTO,
    QuizAttemptDTO,
    QuizSummaryDTO, RegisteredUserDTO
} from "../../IsaacApiTypes";
import {partition} from "lodash";

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
    const quizzes = useAppSelector(selectors.quizzes.available);
    const [filteredQuizzes, setFilteredQuizzes] = useState<Array<QuizSummaryDTO> | undefined>();
    const {filter}: {filter?: string} = useQueryParams();
    const startIndex = 0;
    const [titleFilter, setTitleFilter] = useState<string|undefined>(filter?.replace(/[^a-zA-Z0-9 ]+/g, ''));

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(loadQuizzes(startIndex));
    }, [dispatch, startIndex]);

    useEffect(() => {
        if (isDefined(titleFilter) && isDefined(quizzes)) {
            const results = quizzes
                .filter(quiz => quiz.title?.toLowerCase().match(titleFilter.toLowerCase()) || quiz.id?.toLowerCase().match(titleFilter.toLowerCase()))
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

export function useCurrentQuizAttempt(studentId?: number) {
    const currentUserAttemptState = useAppSelector(selectors.quizzes.currentQuizAttempt);
    const [currentUserAttempt, currentUserError] = useMemo(() => {
        if (!isDefined(currentUserAttemptState)) return [];
        return [
            'attempt' in currentUserAttemptState ? currentUserAttemptState.attempt : undefined,
            'error' in currentUserAttemptState ? currentUserAttemptState.error : undefined
        ];
    }, [currentUserAttemptState]);

    const studentAttemptState = useAppSelector(selectors.quizzes.currentStudentQuizAttempt);
    const [studentAttempt, studentError, studentUser] = useMemo(() => {
        if (!isDefined(studentAttemptState)) return [];
        return [
            'studentAttempt' in studentAttemptState ? studentAttemptState.studentAttempt.attempt : undefined,
            'error' in studentAttemptState ? studentAttemptState.error : undefined,
            'studentAttempt' in studentAttemptState ? studentAttemptState.studentAttempt.user : undefined
        ];
    }, [studentAttemptState]);

    // If we have a student id, then we're asking for the attempt for a given student
    const [attempt, error] = studentId
        ? [studentAttempt, studentError]
        : [currentUserAttempt, currentUserError];

    const questions = useQuizQuestions(attempt);
    const sections = useQuizSections(attempt);

    const dispatch = useAppDispatch();
    useEffect( () => {
        // All register questions does is store the questions in redux WITH SOME EXTRA CALCULATED STRUCTURE
        dispatch(registerQuestions(questions));
        return () => dispatch(deregisterQuestions(questions.map(q => q.id as string)));
    }, [dispatch, questions]);

    return {attempt, error, studentUser, questions, sections};
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
