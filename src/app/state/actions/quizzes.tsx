import React, {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE, api} from "../../services";
import {
    AppDispatch,
    AppState,
    closeActiveModal,
    extractMessage, isaacApi,
    openActiveModal, questionsSlice,
    selectors,
    showAxiosErrorToastIfNeeded
} from "../index";
import {ContentSummaryDTO, IsaacQuizDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../IsaacApiTypes";
import {QuizSettingModal} from "../../components/elements/modals/QuizSettingModal";

export const loadQuizzes = (startIndex: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZZES_REQUEST});
    try {
        const quizzes = await api.quizzes.available(startIndex);
        dispatch({type: ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS, quizzes: quizzes.data});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Loading tests failed", e));
    }
};

export const setQuiz = (assignment: QuizAssignmentDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_SET_REQUEST, assignment});
    try {
        const newAssignment = await api.quizzes.createQuizAssignment(assignment);
        dispatch({type: ACTION_TYPE.QUIZ_SET_RESPONSE_SUCCESS, newAssignment: newAssignment.data});
        return newAssignment;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Test setting failed", e));
        throw e;
    }
};

export const showQuizSettingModal = (quiz: ContentSummaryDTO | IsaacQuizDTO, dueDate?: Date | null, feedbackMode?: QuizFeedbackMode | null) => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal())
        },
        title: `Setting test '${quiz.title ?? quiz.id}'`,
        body: <QuizSettingModal quiz={quiz} dueDate={dueDate} feedbackMode={feedbackMode}/>
    }));
}

export const loadQuizAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_REQUEST});
    try {
        const assignments = await api.quizzes.assignments();
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignments.data});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Loading test assignments failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_FAILURE});
    }
};

export const loadQuizAssignedToMe = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_REQUEST});
    try {
        const assignments = await api.quizzes.assignedToMe();
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS, assignments: assignments.data});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Loading tests assigned to you failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_FAILURE});
    }
};

export const loadQuizAssignmentAttempt = (quizAssignmentId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST, quizAssignmentId});
    try {
        const attempt = await api.quizzes.loadQuizAssignmentAttempt(quizAssignmentId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS, attempt: attempt.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading assigned quiz attempt failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const clearQuizAttempt = () => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS, attempt: {}});
};

export const clearStudentQuizAttempt = () => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_SUCCESS, studentAttempt: {}});
};

export const submitQuizQuestionIfDirty = (quizAttemptId: number, questionId: string) => async (dispatch: AppDispatch, getState: () => AppState) => {
    // Get current answer
    const state = getState();
    const questions = selectors.questions.getQuestions(state);
    if (questions) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const attempt = question.currentAttempt;
            if (attempt && question.canSubmit) {
                // This clears the canSubmit flag so we need to dispatch it, even though we're crossing reducers.
                dispatch(questionsSlice.actions.markQuestionAsSubmitted(questionId));
                await api.quizzes.answer(quizAttemptId, questionId, attempt);
                // Response is empty, so dispatch nothing
            }
        }
    }
};

export const markQuizAttemptAsComplete = (quizAttemptId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_REQUEST, quizAttemptId});
    try {
        const attempt = await api.quizzes.markQuizAttemptAsComplete(quizAttemptId);
        dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS, attempt: attempt.data});
        return true;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Failed to submit your test answers", e));
        return false;
    }
};

export const loadQuizAttemptFeedback = (quizAttemptId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_FEEDBACK_REQUEST, quizAttemptId});
    try {
        const attempt = await api.quizzes.loadQuizAttemptFeedback(quizAttemptId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS, attempt: attempt.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading quiz feedback failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const loadStudentQuizAttemptFeedback = (quizAttemptId: number, userId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_REQUEST, quizAttemptId, userId});
    try {
        const studentAttempt = await api.quizzes.loadStudentQuizAttemptFeedback(quizAttemptId, userId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_SUCCESS, studentAttempt: studentAttempt.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading student quiz feedback failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_STUDENT_ATTEMPT_FEEDBACK_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const loadQuizAssignmentFeedback = (quizAssignmentId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_REQUEST, quizAssignmentId});
    try {
        const assignment = await api.quizzes.loadQuizAssignmentFeedback(quizAssignmentId);
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_SUCCESS, assignment: assignment.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading quiz feedback failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_FEEDBACK_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const markQuizAsCancelled = (quizAssignmentId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_CANCEL_ASSIGNMENT_REQUEST, quizAssignmentId});
    try {
        await api.quizzes.cancelQuizAssignment(quizAssignmentId);
        dispatch({type: ACTION_TYPE.QUIZ_CANCEL_ASSIGNMENT_RESPONSE_SUCCESS, quizAssignmentId});
        return true;
    } catch (e) {
        dispatch({type: ACTION_TYPE.QUIZ_CANCEL_ASSIGNMENT_RESPONSE_FAILURE, quizAssignmentId});
        dispatch(showAxiosErrorToastIfNeeded("Failed to cancel test", e));
        return false;
    }
};

export const loadQuizPreview = (quizId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_PREVIEW_REQUEST, quizId});
    try {
        const quiz = await api.quizzes.loadQuizPreview(quizId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_PREVIEW_RESPONSE_SUCCESS, quiz: quiz.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading quiz preview failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_PREVIEW_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const loadFreeQuizAttempt = (quizId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_START_FREE_ATTEMPT_REQUEST, quizId});
    try {
        const attempt = await api.quizzes.loadFreeQuizAttempt(quizId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_SUCCESS, attempt: attempt.data});
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Loading quiz failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ATTEMPT_RESPONSE_FAILURE, error: extractMessage(e)});
    }
};

export const loadQuizzesAttemptedFreelyByMe = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ATTEMPTED_FREELY_BY_ME_REQUEST});
    try {
        const attempts = await api.quizzes.loadAttemptedFreelyByMe();
        dispatch({type: ACTION_TYPE.QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_SUCCESS, attempts: attempts.data});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Loading freely attempted tests failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ATTEMPTED_FREELY_BY_ME_RESPONSE_FAILURE});
    }
};

export const returnQuizToStudent = (quizAssignmentId: number, studentId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_INCOMPLETE_REQUEST});
    try {
        const feedback = await api.quizzes.markQuizAttemptAsIncomplete(quizAssignmentId, studentId);
        dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_INCOMPLETE_RESPONSE_SUCCESS, quizAssignmentId, feedback: feedback.data});
        return true;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Failed to return work to the student", e));
        return false;
    }
};

export const updateQuizAssignmentFeedbackMode = (quizAssignmentId: number, quizFeedbackMode: QuizFeedbackMode) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_UPDATE_REQUEST});
    try {
        const update = {quizFeedbackMode};
        await api.quizzes.updateQuizAssignment(quizAssignmentId, update);
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_UPDATE_RESPONSE_SUCCESS, quizAssignmentId, update});
        return true;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Failed to update feedback mode", e));
        return false;
    }
};

export const updateQuizAssignmentDueDate = (quizAssignmentId: number, dueDate: Date) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_UPDATE_REQUEST});
    try {
        const update = {dueDate};
        await api.quizzes.updateQuizAssignment(quizAssignmentId, update);
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENT_UPDATE_RESPONSE_SUCCESS, quizAssignmentId, update});
        return true;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Failed to update due date", e));
        return false;
    }
};

export const logQuizSectionView = (quizAttemptId: number, page: number) => async () => {
    // No actual dispatch
    api.quizzes.logQuizSectionView(quizAttemptId, page);
};

