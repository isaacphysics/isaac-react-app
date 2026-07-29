import {Dispatch} from "react";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE, api} from "../../services";
import {
    AppState,
    extractMessage,
    selectors,
    showAxiosErrorToastIfNeeded
} from "../index";
import debounce from "lodash/debounce";
import { isAxiosError } from "axios";

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
    dispatch({type: ACTION_TYPE.QUIZ_ATTEMPT_CLEAR});
};

const debouncedDispatch = debounce(async (dispatch: Dispatch<Action>, quizAttemptId: number, questionId: string, attempt) => {
    // This clears the canSubmit flag so we need to dispatch it, even though we're crossing reducers.
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    try {
        await api.quizzes.answer(quizAttemptId, questionId, attempt);
    } catch (e: any) {
        if (isAxiosError(e) && e.response?.data?.errorMessage) {
            if (![401, 403].includes(e.response.status)) { // 401 is not logged in, 403 is the "Assignment cancelled" error – the instructions below do not apply
                e.response.data.errorMessage += " We recommend reloading the page and trying again, after carefully saving your answer elsewhere."; 
            }
        }
        dispatch(showAxiosErrorToastIfNeeded("Failed to save", e, 20000)); // longer timeout than most, as test errors are likely serious
    }
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
                void debouncedDispatch(dispatch, quizAttemptId, questionId, attempt);
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
