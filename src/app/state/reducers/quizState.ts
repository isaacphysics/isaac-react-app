import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE, extractQuestions} from "../../services";
import {
    ChoiceDTO,
    QuizAttemptDTO,
} from "../../../IsaacApiTypes";
import {produce, Immutable} from "immer";

const updateQuizAttemptQuestion = (questionId: string, questionAttempt: Immutable<ChoiceDTO>) => produce<{attempt: QuizAttemptDTO}>((quizAttempt) => {
    const quizQuestions = extractQuestions(quizAttempt?.attempt.quiz);
    quizQuestions.forEach(question => {
        if (question.id === questionId && (question.bestAttempt === null || question.bestAttempt?.correct === undefined)) {
            question.bestAttempt = {answer: questionAttempt};
        }
    });
});

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
        case ACTION_TYPE.QUIZ_START_FREE_ATTEMPT_REQUEST:
            if (possibleAttempt && 'attempt' in possibleAttempt && possibleAttempt.attempt.quizId === action.quizId) {
                // Optimistically keep current attempt
                return possibleAttempt;
            }
            return null;
        // The next two reducer cases update the current quiz attempt when the user answers a question, to keep
        // the `bestAttempt`s in sync.
        case ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT:
            if (possibleAttempt && 'attempt' in possibleAttempt) {
                const questionAttempt = 'choice' in action.attempt ? action.attempt.choice : action.attempt;
                return updateQuizAttemptQuestion(action.questionId, questionAttempt)(possibleAttempt);
            }
            return possibleAttempt;
        case ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS:
            const questionAttempt = action.response.answer;
            if (questionAttempt && possibleAttempt && 'attempt' in possibleAttempt) {
                return updateQuizAttemptQuestion(action.questionId, questionAttempt)(possibleAttempt);
            }
            return possibleAttempt;
        default:
            return possibleAttempt;
    }
};
