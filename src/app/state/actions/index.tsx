import React, {Dispatch} from "react";
import {
    ACTION_TYPE,
    api,
    API_REQUEST_FAILURE_MESSAGE,
    FIRST_LOGIN_STATE,
    history,
    isFirstLoginInPersistence,
    KEY,
    persistence,
    QUESTION_ATTEMPT_THROTTLED_MESSAGE,
    trackEvent
} from "../../services";
import {
    Action,
    AppGroupMembership,
    CredentialsAuthDTO,
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
    AppDispatch
} from "../index";
import {Immutable} from "immer";

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

// User authentication
export const getUserAuthSettings = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST});
    try {
        const authenticationSettings = await api.authentication.getCurrentUserAuthSettings();
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS, userAuthSettings: authenticationSettings.data});
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const getChosenUserAuthSettings = (userId: number) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_REQUEST});
    try {
        const authenticationSettings = await api.authentication.getSelectedUserAuthSettings(userId);
        dispatch({type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_RESPONSE_SUCCESS, selectedUserAuthSettings: authenticationSettings.data});
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.SELECTED_USER_AUTH_SETTINGS_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const linkAccount = (provider: AuthenticationProvider) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_LINK_REQUEST});
    try {
        const redirectResponse = await api.authentication.linkAccount(provider);
        const redirectUrl = redirectResponse.data.redirectUrl;
        dispatch({type: ACTION_TYPE.USER_AUTH_LINK_RESPONSE_SUCCESS, provider, redirectUrl: redirectUrl});
        window.location.href = redirectUrl;
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_AUTH_LINK_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
        dispatch(showAxiosErrorToastIfNeeded("Failed to link account", e));
    }
};

export const unlinkAccount = (provider: AuthenticationProvider) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_UNLINK_REQUEST});
    try {
        await api.authentication.unlinkAccount(provider);
        dispatch({type: ACTION_TYPE.USER_AUTH_UNLINK_RESPONSE_SUCCESS, provider});
        await Promise.all([
            dispatch(getUserAuthSettings() as any)
        ]);
        dispatch(showToast({
            title: "Account unlinked",
            body: "Your account settings were updated successfully.",
            color: "success",
            timeout: 5000,
            closable: false,
        }) as any);
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_AUTH_UNLINK_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
        dispatch(showAxiosErrorToastIfNeeded("Failed to unlink account", e));
    }
};

export const submitTotpChallengeResponse = (mfaVerificationCode: string, rememberMe: boolean) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUEST});
    try {
        const result = await api.authentication.mfaCompleteLogin(mfaVerificationCode, rememberMe);
        // Request user preferences, as we do in the requestCurrentUser action:
        await Promise.all([
            dispatch(getUserAuthSettings() as any),
            dispatch(getUserPreferences() as any)
        ]);
        dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_SUCCESS});
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: result.data});
        history.replace(persistence.pop(KEY.AFTER_AUTH_PATH) || "/");
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_FAILURE, errorMessage: extractMessage(e)});
        dispatch(showAxiosErrorToastIfNeeded("Error with verification code.", e));
    }
};

export const getUserPreferences = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PREFERENCES_REQUEST});
    try {
        const userPreferenceSettings = await api.users.getPreferences();
        dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS, userPreferences: userPreferenceSettings.data});
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CURRENT_USER_REQUEST});
    try {
        // Request the user
        const currentUser = await api.users.getCurrent();
        // Now with that information request auth settings and preferences asynchronously
        await Promise.all([
            dispatch(getUserAuthSettings() as any),
            dispatch(getUserPreferences() as any)
        ]);
        dispatch({type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, user: currentUser.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE});
    }
};

// TODO scope for pulling out a separate registerUser method from this
export const updateCurrentUser = (
    updatedUser: Immutable<ValidationUser>,
    updatedUserPreferences: UserPreferencesDTO,
    userContexts: UserContext[] | undefined,
    passwordCurrent: string | null,
    currentUser: Immutable<PotentialUser>,
    redirect: boolean
) => async (dispatch: Dispatch<Action>) => {
    // Confirm email change
    if (currentUser.loggedIn && currentUser.id == updatedUser.id) {
        if (currentUser.loggedIn && currentUser.email !== updatedUser.email) {
            const emailChangeConfirmed = window.confirm(
                "You have edited your email address. Your current address will continue to work until you verify your " +
                "new address by following the verification link sent to it via email. Continue?"
            );
            if (!emailChangeConfirmed) {
                dispatch(showToast({
                    title: "Account settings not updated",
                    body: "Your account settings update was cancelled.",
                    color: "danger",
                    timeout: 5000,
                    closable: false,
                }) as any);
                return; //early
            }
        }
    }

    const editingOtherUser = currentUser.loggedIn && currentUser.id != updatedUser.id;

    try {
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST});
        const currentUser = await api.users.updateCurrent(updatedUser, updatedUserPreferences, passwordCurrent, userContexts);
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS, user: currentUser.data});
        await dispatch(requestCurrentUser() as any);

        const isFirstLogin = isFirstLoginInPersistence() || false;
        if (isFirstLogin) {
            persistence.session.remove(KEY.FIRST_LOGIN);
            if (redirect) {
                history.push(persistence.pop(KEY.AFTER_AUTH_PATH) || '/account', {firstLogin: isFirstLogin});
            }
        } else if (!editingOtherUser) {
            dispatch(showToast({
                title: "Account settings updated",
                body: "Your account settings were updated successfully.",
                color: "success",
                timeout: 5000,
                closable: false,
            }) as any);
        } else if (editingOtherUser) {
            redirect && history.push('/');
            dispatch(showToast({
                title: "Account settings updated",
                body: "The user's account settings were updated successfully.",
                color: "success",
                timeout: 5000,
                closable: false,
            }) as any);
        }
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_REQUEST});
    try {
        await api.authentication.logout();
        dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Logout failed", e));
    }
};

export const logOutUserEverywhere = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_REQUEST});
    try {
        await api.authentication.logoutEverywhere();
        dispatch({type: ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Logout everywhere failed", e));
    }
};

export const logInUser = (provider: AuthenticationProvider, credentials: CredentialsAuthDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_IN_REQUEST, provider});

    try {
        const result = await api.authentication.login(provider, credentials);

        if (result.status === 202) {
            // indicates MFA is required for this user and user isn't logged in yet.
            dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUIRED});
            return;
        }
        // Request user preferences, as we do in the requestCurrentUser action:
        await Promise.all([
            dispatch(getUserAuthSettings() as any),
            dispatch(getUserPreferences() as any)
        ]);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: result.data});
        history.replace(persistence.pop(KEY.AFTER_AUTH_PATH) || "/");
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE, errorMessage: extractMessage(e)})
    }
};

export const resetPassword = (params: {email: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST});
    try {
        await api.users.passwordReset(params);
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS});
        dispatch(showToast({
            color: "success",
            title: "Password reset email sent",
            body: `If an account exists with the email address ${params.email}, we have sent you a password reset email. If you don’t receive an email, you may not have an account with this email address.`,
            timeout: 10000
        }) as any);
    } catch (e: any) {
        dispatch(showAxiosErrorToastIfNeeded("Password reset failed", e));
    }
};

export const verifyPasswordReset = (token: string | null) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST});
        await api.users.verifyPasswordReset(token);
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_SUCCESS});
    } catch(e: any) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const handlePasswordReset = (params: {token: string; password: string}) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST});
        await api.users.handlePasswordReset(params);
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS});
        history.push('/login');
        dispatch(showToast({color: "success", title: "Password reset successful", body: "Please log in with your new password.", timeout: 5000}) as any);
    } catch(e: any) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const handleProviderLoginRedirect = (provider: AuthenticationProvider, isSignup: boolean = false) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT, provider});
    try {
        const redirectResponse = await api.authentication.getRedirect(provider, isSignup);
        const redirectUrl = redirectResponse.data.redirectUrl;
        dispatch({type: ACTION_TYPE.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
        window.location.href = redirectUrl;
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Login redirect failed", e));
    }
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: AuthenticationProvider, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK});
    try {
        const providerResponse = await api.authentication.checkProviderCallback(provider, parameters);
        // Request user preferences, as we do in the requestCurrentUser action:
        await Promise.all([
            dispatch(getUserAuthSettings() as any),
            dispatch(getUserPreferences() as any)
        ]);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: providerResponse.data});
        if (providerResponse.data.firstLogin) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
            trackEvent("registration", {props:
                    {
                        provider: provider,
                    }
                }
            )
            ReactGA4.event({
                category: 'user',
                action: 'registration',
                label: `Create Account (${provider})`,
            });
        }
        const nextPage = persistence.load(KEY.AFTER_AUTH_PATH);
        persistence.remove(KEY.AFTER_AUTH_PATH);
        history.push(nextPage?.replace("#!", "") || "/account");
    } catch (error: any) {
        history.push("/auth_error", { errorMessage: extractMessage(error) });
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE, errorMessage: "Login Failed"});
        dispatch(showAxiosErrorToastIfNeeded("Login Failed", error));
    }
};

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

// Admin

export const resetMemberPassword = (member: AppGroupMembership) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_REQUEST, member});
    try {
        await api.users.passwordResetById(member.groupMembershipInformation.userId as number);
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS, member});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE, member});
        dispatch(showAxiosErrorToastIfNeeded("Failed to send password reset", e));
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
