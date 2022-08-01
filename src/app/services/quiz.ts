import {useEffect, useMemo} from "react";
import {useAppDispatch, useAppSelector} from "../state/store";
import {isDefined} from "./miscUtils";
import {ContentDTO, IsaacQuizSectionDTO, QuestionDTO, QuizAssignmentDTO, QuizAttemptDTO} from "../../IsaacApiTypes";
import {selectors} from "../state/selectors";
import {deregisterQuestions, registerQuestions} from "../state/actions";
import {API_PATH} from "./constants";
import {partition} from "lodash";
import {isQuestion} from "./questions";

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

export function useQuizQuestions(attempt: QuizAttemptDTO | null) {
    return useMemo(() => {
        return extractQuestions(attempt?.quiz);
    }, [attempt?.quiz]);
}

export function useQuizSections(attempt: QuizAttemptDTO | null) {
    return useMemo(() => {
        const sections: { [id: string]: IsaacQuizSectionDTO } = {};
        attempt?.quiz?.children?.forEach(section => {
            sections[section.id as string] = section as IsaacQuizSectionDTO;
        });
        return sections;
    }, [attempt?.quiz]);
}

export function useCurrentQuizAttempt() {
    const attemptState = useAppSelector(selectors.quizzes.currentQuizAttempt);
    const studentAttemptState = useAppSelector(selectors.quizzes.currentStudentQuizAttempt);
    const error = isDefined(attemptState) && 'error' in attemptState ? attemptState.error : null;
    const attempt = isDefined(attemptState) && 'attempt' in attemptState ? attemptState.attempt : null;
    const studentError = isDefined(studentAttemptState) && 'error' in studentAttemptState ? studentAttemptState.error : null;
    const studentAttempt = isDefined(studentAttemptState) && 'studentAttempt' in studentAttemptState ? studentAttemptState.studentAttempt.attempt : null;
    const studentUser = isDefined(studentAttemptState) && 'studentAttempt' in studentAttemptState ? studentAttemptState.studentAttempt.user : undefined;
    const questions = useQuizQuestions(isDefined(studentAttempt) ? studentAttempt : attempt);
    const sections = useQuizSections(isDefined(studentAttempt) ? studentAttempt : attempt);

    const dispatch = useAppDispatch();

    useEffect( () => {
        // All register questions does is store the questions in redux WITH SOME EXTRA CALCULATED STRUCTURE
        dispatch(registerQuestions(questions));
        return () => dispatch(deregisterQuestions(questions.map(q => q.id as string)));
    }, [dispatch, questions]);

    return {attempt, studentAttempt, studentUser, questions, sections, error, studentError};
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
