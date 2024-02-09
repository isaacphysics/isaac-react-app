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
import {ContentSummaryDTO, IsaacQuizDTO, QuizFeedbackMode} from "../../../IsaacApiTypes";
import {QuizSettingModal} from "../../components/elements/modals/QuizSettingModal";
import { debounce } from "lodash";

export const showQuizSettingModal = (quiz: ContentSummaryDTO | IsaacQuizDTO, dueDate?: Date | null, scheduledStartDate?: Date | null, feedbackMode?: QuizFeedbackMode | null) => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal());
        },
        title: `Setting test '${quiz.title ?? quiz.id}'`,
        body: <QuizSettingModal quiz={quiz} dueDate={dueDate} scheduledStartDate={scheduledStartDate} feedbackMode={feedbackMode}/>
    }));
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

const debouncedDispatch = debounce(async (dispatch: Dispatch<Action>, quizAttemptId: number, questionId: string, attempt) => {
    // This clears the canSubmit flag so we need to dispatch it, even though we're crossing reducers.
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    await api.quizzes.answer(quizAttemptId, questionId, attempt);
    // Response is empty, so dispatch nothing
}, 500);

export const submitQuizQuestionIfDirty = (quizAttemptId: number, questionId: string) => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Get current answer
    const state = getState();
    const questions = selectors.questions.getQuestions(state);
    if (questions) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const attempt = question.currentAttempt;
            if (attempt && question.canSubmit) {
                debouncedDispatch(dispatch, quizAttemptId, questionId, attempt);
            }
        }
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
