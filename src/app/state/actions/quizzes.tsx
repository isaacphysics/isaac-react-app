import React, {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE, api} from "../../services";
import {
    AppDispatch,
    AppState,
    closeActiveModal,
    extractMessage,
    openActiveModal,
    selectors,
    showAxiosErrorToastIfNeeded
} from "../index";
import {ContentSummaryDTO, IsaacQuizDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../IsaacApiTypes";
import {QuizSettingModal} from "../../components/elements/modals/QuizSettingModal";

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

export const showQuizSettingModal = (quiz: ContentSummaryDTO | IsaacQuizDTO, allowedToSchedule?: boolean, dueDate?: Date | null, scheduledStartDate?: Date | null, feedbackMode?: QuizFeedbackMode | null) => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal())
        },
        title: `Setting test '${quiz.title ?? quiz.id}'`,
        body: <QuizSettingModal quiz={quiz} dueDate={dueDate} scheduledStartDate={scheduledStartDate} feedbackMode={feedbackMode} allowedToSchedule={allowedToSchedule}/>
    }));
}

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

export const submitQuizQuestionIfDirty = (quizAttemptId: number, questionId: string) => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Get current answer
    const state = getState();
    const questions = selectors.questions.getQuestions(state);
    if (questions) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const attempt = question.currentAttempt;
            if (attempt && question.canSubmit) {
                // This clears the canSubmit flag so we need to dispatch it, even though we're crossing reducers.
                dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
                await api.quizzes.answer(quizAttemptId, questionId, attempt);
                // Response is empty, so dispatch nothing
            }
        }
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
