import React, {Dispatch} from "react";
import {
    ACTION_TYPE,
    api,
    API_REQUEST_FAILURE_MESSAGE,
    history,
    KEY,
    persistence,
    QUESTION_ATTEMPT_THROTTLED_MESSAGE,
    trackEvent
} from "../../services";
import {
    Action,
    FreeTextRule,
    PotentialUser,
    UserPreferencesDTO,
    ValidatedChoice,
    ValidationUser,
} from "../../../IsaacAppTypes";
import {
    AuthenticationProvider,
    ChoiceDTO,
    IsaacQuestionPageDTO,
    QuestionDTO,
    TestCaseDTO,
    UserContext
} from "../../../IsaacApiTypes";
import {AxiosError} from "axios";
import ReactGA4 from "react-ga4";
import {isaacBooksModal} from "../../components/elements/modals/IsaacBooksModal";
import {
    AppState,
    store,
    errorSlice,
    routerPageChange,
    closeActiveModal,
    openActiveModal,
    showToast,
    logAction,
    isaacApi,
    AppDispatch,
    authApi
} from "../index";
import {Immutable} from "immer";
import {AnyAction} from "redux";

// Utility functions
function isAxiosError(e: Error): e is AxiosError {
    return 'isAxiosError' in e && (e as AxiosError).isAxiosError;
}

export function extractMessage(e: Error) {
    if (isAxiosError(e) && e.response && e.response.data && e.response.data.errorMessage) {
        return e.response.data.errorMessage;
    }
    return API_REQUEST_FAILURE_MESSAGE;
}

export function showAxiosErrorToastIfNeeded(error: string, e: any) {
    if (e) {
        if (e.response) {
            if (e.response.status < 500) {
                return showToast({
                    color: "danger", title: error, timeout: 5000,
                    body: extractMessage(e),
                }) as any;
            }
        } else {
            trackEvent("exception", {props:
                        {
                            description: `load_fail: ${error}`,
                            fatal: true
                        }
                }
            )
            ReactGA4.gtag("event", "exception", {
                description: `load_fail: ${error}`
            });
            return showToast({
                color: "danger", title: error, timeout: 5000,
                body: API_REQUEST_FAILURE_MESSAGE
            });
        }
    }
    return {type: ACTION_TYPE.TEST_ACTION};
}

export const openIsaacBooksModal = () => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(isaacBooksModal()) as any);
};
export const requestNotifications = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.NOTIFICATIONS_REQUEST});
    try {
        const response = await api.notifications.get();
        dispatch({type: ACTION_TYPE.NOTIFICATIONS_RESPONSE_SUCCESS, notifications: response.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.NOTIFICATIONS_RESPONSE_FAILURE});
    }
}

// Questions
export const registerQuestions = (questions: QuestionDTO[], accordionClientId?: string, isQuiz?: boolean) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_REGISTRATION, questions, accordionClientId, isQuiz});
};

export const deregisterQuestions = (questionIds: string[]) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionIds});
};

interface Attempt {
    attempts: number;
    timestamp: number;
}
const attempts: {[questionId: string]: Attempt} = {};

export const attemptQuestion = (questionId: string, attempt: Immutable<ChoiceDTO>, gameboardId?: string) => async (dispatch: AppDispatch, getState: () => AppState) => {
    const state = getState();
    const isAnonymous = !(state && state.user && state.user.loggedIn);
    const timePeriod = isAnonymous ? 5 * 60 * 1000 : 15 * 60 * 1000;

    try {
        dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
        const response = await api.questions.answer(questionId, attempt);
        dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
        if (gameboardId) {
            dispatch(isaacApi.util.invalidateTags([{type: "Gameboard", id: gameboardId}]));
        }

        // This mirrors the soft limit checking on the server
        let lastAttempt = attempts[questionId];
        if (lastAttempt && lastAttempt.timestamp + timePeriod > Date.now()) {
            lastAttempt.attempts++;
            lastAttempt.timestamp = Date.now();
        } else {
            lastAttempt = {
                attempts: 1,
                timestamp: Date.now()
            };
            attempts[questionId] = lastAttempt;
        }
        const softLimit = isAnonymous ? 3 : 10;
        if (lastAttempt.attempts >= softLimit && !response.data.correct) {
            dispatch(showToast({
                color: "warning", title: "Approaching attempts limit", timeout: 10000,
                body: "You have entered several guesses for this question; soon it will be temporarily locked."
            }) as any);
        }
    } catch (e: any) {
        if (e.response && e.response.status === 429) {
            const errorMessage = e.response?.data?.errorMessage || QUESTION_ATTEMPT_THROTTLED_MESSAGE;
            const lock = new Date((new Date()).getTime() + timePeriod);

            dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE, questionId, lock});
            dispatch(showToast({
                color: "danger", title: "Too many attempts", timeout: 10000,
                body: errorMessage
            }) as any);
            setTimeout( () => {
                dispatch({type: ACTION_TYPE.QUESTION_UNLOCK, questionId});
            }, timePeriod);
        } else {
            dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE, questionId});
            dispatch(showToast({
                color: "danger", title: "Question attempt failed", timeout: 5000,
                body: "Your answer could not be checked. Please try again."
            }) as any);
        }
    }
};

export function setCurrentAttempt<T extends ChoiceDTO>(questionId: string, attempt: Immutable<T | ValidatedChoice<T>>) {
    return (dispatch: Dispatch<Action>) => dispatch({
        type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT,
        questionId,
        attempt
    });
}

export const goToSupersededByQuestion = (page: IsaacQuestionPageDTO) => async (dispatch: Dispatch<Action>) =>  {
    if (page.supersededBy) {
        dispatch(logAction({
            type: "VIEW_SUPERSEDED_BY_QUESTION", questionId: page.id, supersededBy: page.supersededBy
        }) as any);
        history.push(`/questions/${page.supersededBy}`);
    }
};

// Quizzes
const generatePostQuizUrl = (quizId: string) => `/pages/post_${quizId}`;

export const submitQuizPage = (quizId: string) => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    const currentState: AppState = getState();
    try {
        dispatch({type: ACTION_TYPE.QUIZ_SUBMISSION_REQUEST, quizId});
        if (currentState && currentState.questions) {
            await Promise.all(currentState.questions.questions.map(
                question => {
                    if (question.id && question.currentAttempt) {
                        dispatch(attemptQuestion(question.id, question.currentAttempt) as any);
                    }
                }
            ));
            dispatch({type: ACTION_TYPE.QUIZ_SUBMISSION_RESPONSE_SUCCESS});
            dispatch(showToast({color: "success", title: "Test submitted", body: "Test submitted successfully", timeout: 3000}) as any);
            history.push(generatePostQuizUrl(quizId));
        }
    } catch (e) {
        dispatch({type: ACTION_TYPE.QUIZ_SUBMISSION_RESPONSE_FAILURE});
        dispatch(showAxiosErrorToastIfNeeded("Error submitting test", e));
    }
};

export const redirectForCompletedQuiz = (quizId: string) => (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal({
        closeAction: () => {dispatch(closeActiveModal() as any)},
        title: "Test already submitted",
        body: <div className="text-center my-5 pb-4">
            <strong>A submission has already been recorded for this test by your account.</strong>
        </div>
    }) as any);
    history.push(generatePostQuizUrl(quizId));
};

// Question testing
export const testQuestion = (questionChoices: FreeTextRule[], testCases: TestCaseDTO[]) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.TEST_QUESTION_REQUEST});
        const testResponse = await api.questions.testFreeTextQuestion(questionChoices, testCases);
        dispatch({type: ACTION_TYPE.TEST_QUESTION_RESPONSE_SUCCESS, testCaseResponses: testResponse.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.TEST_QUESTION_RESPONSE_FAILURE});
        dispatch(showAxiosErrorToastIfNeeded("Failed to test question", e));
    }
};

// SERVICE ACTIONS (w/o dispatch)

export const changePage = (path: string) => {
    history.push(path);
};

// Hard redirect (refreshes page)
export const redirectTo = (path: string) => {
    window.location.href = window.location.origin + path;
};

export const registerPageChange = (path: string) => {
    store.dispatch(routerPageChange(path));
};

export const handleServerError = () => {
    store.dispatch(errorSlice.actions.apiServerError());
};

export const handleApiGoneAway = () => {
    store.dispatch(errorSlice.actions.apiGoneAway());
};

export const setAssignBoardPath = (path: string) => {
    persistence.save(KEY.ASSIGN_BOARD_PATH, path);
};
