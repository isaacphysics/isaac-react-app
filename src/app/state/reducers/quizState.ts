import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {ContentSummaryDTO, IsaacQuizDTO, QuizAssignmentDTO, QuizAttemptDTO} from "../../../IsaacApiTypes";

type QuizState = {quizzes: ContentSummaryDTO[]; total: number} | null;
export const quizzes = (quizzes: QuizState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS:
            return {quizzes: action.quizzes.results as ContentSummaryDTO[], total: action.quizzes.totalResults as number};
        default:
            return quizzes;
    }
};

type QuizAssignmentsState = QuizAssignmentDTO[] | null;
export const quizAssignments = (quizAssignments: QuizAssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION_TYPE.QUIZ_SET_RESPONSE_SUCCESS:
            return [...quizAssignments ?? [], action.newAssignment];
        default:
            return quizAssignments;
    }
}

type QuizAssignedToMeState = QuizAssignmentDTO[] | null;
export const quizAssignedToMe = (quizAssignments: QuizAssignedToMeState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS:
            return quizAssignments?.map(assignment => {
                if (assignment.attempt?.id === action.quizAttemptId) {
                    return {
                        ...assignment,
                        attempt: {
                            ...assignment.attempt,
                            completedDate: new Date(),
                        },
                    };
                }
                return assignment;
            }) ?? null;
        default:
            return quizAssignments;
    }
}

type QuizAttemptState = QuizAttemptDTO | null;
export const quizAttempt = (quizAssignment: QuizAttemptState = null, action: Action): QuizAttemptState => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_RESPONSE_SUCCESS:
            return action.attempt;
        case ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST:
            if (quizAssignment && quizAssignment.quizAssignmentId === action.quizAssignmentId) {
                // Optimisically keep current attempt
                return quizAssignment;
            }
            return null;
        default:
            return quizAssignment;
    }
}
