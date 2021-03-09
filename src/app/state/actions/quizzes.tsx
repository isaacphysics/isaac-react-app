import React, {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {api} from "../../services/api";
import {closeActiveModal, extractMessage, loadGroups, openActiveModal, showErrorToastIfNeeded} from "../actions";
import {ContentSummaryDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../IsaacApiTypes";
import {AppDispatch} from "../store";
import {WithLoadedSelector} from "../../components/handlers/ShowLoading";
import {selectors} from "../selectors";
import {QuizSettingModal} from "../../components/elements/modals/QuizSettingModal";
import {AppState} from "../reducers";

export const loadQuizzes = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZZES_REQUEST});
    try {
        const quizzes = await api.quizzes.available();
        dispatch({type: ACTION_TYPE.QUIZZES_RESPONSE_SUCCESS, quizzes: quizzes.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quizzes failed", e));
    }
};

export const setQuiz = (assignment: QuizAssignmentDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_SET_REQUEST, assignment});
    try {
        const newAssignment = await api.quizzes.createQuizAssignment(assignment);
        dispatch({type: ACTION_TYPE.QUIZ_SET_RESPONSE_SUCCESS, newAssignment: newAssignment.data});
        return newAssignment;
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Quiz setting failed", e));
        throw e;
    }
};

export const showQuizSettingModal = (quiz: ContentSummaryDTO, dueDate?: Date | null, feedbackMode?: QuizFeedbackMode | null) => (dispatch: AppDispatch) => {
    dispatch(openActiveModal({
        closeAction: () => {
            dispatch(closeActiveModal())
        },
        title: "Setting quiz " + (quiz.title ?? quiz.id),
        body: <WithLoadedSelector
            selector={selectors.groups.active}
            loadingThunk={() => dispatch(loadGroups(false))}
            thenRender={groups => <QuizSettingModal quiz={quiz} groups={groups} dueDate={dueDate} feedbackMode={feedbackMode}/>}
        />
    }));
}

export const loadQuizAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_REQUEST});
    try {
        const assignments = await api.quizzes.assignments();
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignments.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quiz assignments failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNMENTS_RESPONSE_FAILURE});
    }
};

export const loadQuizAssignedToMe = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_REQUEST});
    try {
        const assignments = await api.quizzes.assignedToMe();
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_SUCCESS, assignments: assignments.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading quizzes assigned to you failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_ASSIGNED_TO_ME_RESPONSE_FAILURE});
    }
};

export const loadQuizAssignmentAttempt = (quizAssignmentId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_REQUEST, quizAssignmentId});
    try {
        const attempt = await api.quizzes.loadQuizAssignmentAttempt(quizAssignmentId);
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_RESPONSE_SUCCESS, attempt: attempt.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading assigned quiz attempt failed", e));
        dispatch({type: ACTION_TYPE.QUIZ_LOAD_ASSIGNMENT_ATTEMPT_RESPONSE_FAILURE, error: extractMessage(e)});
    }
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

export const markQuizAttemptAsComplete = (quizAttemptId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_REQUEST, quizAttemptId});
    try {
        const attempt = await api.quizzes.markQuizAttemptAsComplete(quizAttemptId);
        dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_MARK_COMPLETE_RESPONSE_SUCCESS, attempt: attempt.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Failed to submit your quiz answers", e));
    }
};
