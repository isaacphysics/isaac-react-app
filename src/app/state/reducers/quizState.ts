import {Action, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import {ContentSummaryDTO, QuizAssignmentDTO, QuizAttemptDTO} from "../../../IsaacApiTypes";

type QuizState = {quizzes: ContentSummaryDTO[]; total: number} | null;
export const quizzes = (quizzes: QuizState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS:
            return {quizzes: action.quizzes.results as ContentSummaryDTO[], total: action.quizzes.totalResults as number};
        default:
            return quizzes;
    }
};

type QuizAssignmentsState = QuizAssignmentDTO[] | NOT_FOUND_TYPE | null;
export const quizAssignments = (quizAssignments: QuizAssignmentsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_ASSIGNMENTS_REQUEST:
            return null;
        case ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_FAILURE:
            return NOT_FOUND;
        case ACTION_TYPE.QUIZ_SET_RESPONSE_SUCCESS:
            return [...quizAssignments ?? [], action.newAssignment];
        default:
            return quizAssignments;
    }
};

type QuizAssignedToMeState = QuizAssignmentDTO[] | NOT_FOUND_TYPE | null;
export const quizAssignedToMe = (quizAssignments: QuizAssignedToMeState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_REQUEST:
            return null;
        case ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS:
            return action.assignments;
        case ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_FAILURE:
            return NOT_FOUND;
        case ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS:
            return (quizAssignments !== NOT_FOUND && quizAssignments?.map(assignment => {
                if (assignment.attempt?.id === action.attempt.id) {
                    return {
                        ...assignment,
                        attempt: action.attempt,
                    };
                }
                return assignment;
            })) || null;
        default:
            return quizAssignments;
    }
};

type QuizAttemptState = {attempt: QuizAttemptDTO} | {error: string} | null;
export const quizAttempt = (possibleAttempt: QuizAttemptState = null, action: Action): QuizAttemptState => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS:
            return {attempt: action.attempt};
        case ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE:
            return {error: action.error};
        case ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST:
            if (possibleAttempt && 'attempt' in possibleAttempt && possibleAttempt.attempt.quizAssignmentId === action.quizAssignmentId) {
                // Optimistically keep current attempt
                return possibleAttempt;
            }
            return null;
        case ACTION_TYPE.QUIZ_LOAD_ATTEMPT_FEEDBACK_REQUEST:
            if (possibleAttempt && 'attempt' in possibleAttempt && possibleAttempt.attempt.id === action.quizAttemptId) {
                // Optimistically keep current attempt
                return possibleAttempt;
            }
            return null;
        default:
            return possibleAttempt;
    }
};

type QuizAssignmentState = {assignment: QuizAssignmentDTO} | {error: string} | null;
export const quizAssignment = (possibleAssignment: QuizAssignmentState = null, action: Action): QuizAssignmentState => {
    switch (action.type) {
        case ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_REQUEST:
            return null;
        case ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_SUCCESS:
            return {assignment: action.assignment};
        case ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_FAILURE:
            return {error: action.error};
        default:
            return possibleAssignment;
    }
};
