import React, {ContextType, Dispatch} from "react";
import {
    ACTION_TYPE,
    api,
    API_REQUEST_FAILURE_MESSAGE,
    FIRST_LOGIN_STATE,
    history,
    isNotPartiallyLoggedIn,
    isFirstLoginInPersistence,
    isTeacherOrAbove,
    KEY,
    persistence,
    QUESTION_ATTEMPT_THROTTLED_MESSAGE,
    trackEvent,
    siteSpecific,
    isAda,
} from "../../services";
import {
    Action,
    AppGroupMembership,
    CredentialsAuthDTO,
    FreeTextRule,
    InlineContext,
    PotentialUser,
    QuestionSearchQuery,
    UserPreferencesDTO,
    UserSnapshot,
    ValidatedChoice,
    ValidationUser,
} from "../../../IsaacAppTypes";
import {
    AuthenticationProvider,
    ChoiceDTO,
    GlossaryTermDTO,
    IsaacQuestionPageDTO,
    QuestionDTO,
    TestCaseDTO,
    UserContext, UserRole
} from "../../../IsaacApiTypes";
import {AxiosError} from "axios";
import {isaacBooksModal} from "../../components/elements/modals/IsaacBooksModal";
import {
    AppDispatch,
    AppState,
    closeActiveModal,
    errorSlice,
    isaacApi,
    logAction,
    openActiveModal,
    questionsApi,
    routerPageChange,
    showToast,
    store,
} from "../index";
import {Immutable} from "immer";
import { Button } from "reactstrap";

// Utility functions
function isAxiosError(e: Error): e is AxiosError<{errorMessage?: string}, unknown> {
    return 'isAxiosError' in e && (e as AxiosError).isAxiosError;
}

export function extractMessage(e: Error) {
    if (isAxiosError(e) && e.response?.data.errorMessage) {
        return e.response.data.errorMessage;
    }
    return API_REQUEST_FAILURE_MESSAGE;
}

export function fetchErrorFromParameters(parameters: string): { error?: string, errorDescription?: string, parseError?: string } {
    try {
        const parsed = new URLSearchParams(parameters);
        const [error, errorDescription] = [parsed.get('error'), parsed.get('error_description')];
        return {
            ...(null !== error && { error }),
            ...(null !== errorDescription && { errorDescription })
        };
    } catch (e) {
        let parseError = `Failed to parse "${parameters}".`;
        if (e !== null && typeof e === 'object' && 'message' in e) {
            parseError += ` ${e.message}`;
        }
        return { parseError };
    }
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
            trackEvent("exception", {
                props: {
                    description: `load_fail: ${error}`,
                    fatal: true
                }
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
        trackEvent("sign_in_attempt", { props: { provider: provider.toLowerCase(), fromLinkPage: true } });
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
        dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_SUCCESS});
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: result.data});
        // requestCurrentUser gives us extra information like auth settings, preferences and time until session expiry
        await dispatch(requestCurrentUser() as any);
        continueToAfterAuthPath(result.data);
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
        if (isNotPartiallyLoggedIn(currentUser.data)) {
            await Promise.all([
                dispatch(getUserAuthSettings() as any),
                dispatch(getUserPreferences() as any)
            ]);
        }
        const expiry = currentUser.headers["x-session-expires"] ?
            Date.parse(currentUser.headers["x-session-expires"]) : undefined;
        dispatch({type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
            user: {loggedIn: true, sessionExpiry: expiry, ...currentUser.data}});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE});
    }
};


export const partiallyUpdateUserSnapshot = (newUserSnapshot: UserSnapshot) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_SNAPSHOT_PARTIAL_UPDATE, userSnapshot: newUserSnapshot});
};

export const registerNewUser = (
    newUser: Immutable<ValidationUser>,
    newUserPreferences: UserPreferencesDTO,
    newUserContexts: UserContext[] | undefined,
    passwordCurrent: string | null,
) => async (dispatch: Dispatch<Action>) => {

    try {
        // Create the user
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST});
        const currentUser = await api.users.updateCurrent(newUser, newUserPreferences, passwordCurrent, newUserContexts);
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS, user: currentUser.data});
        await dispatch(requestCurrentUser() as any);

        if (isTeacherOrAbove(newUser)) {
            // Redirect to email verification page
            history.push('/verifyemail');
        } else {
            history.push(siteSpecific('/register/preferences', '/register/connect'));
        }
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
    }
};

export const updateCurrentUser = (
    updatedUser: Immutable<ValidationUser>,
    updatedUserPreferences: UserPreferencesDTO,
    userContexts: UserContext[] | undefined,
    passwordCurrent: string | null,
    currentUser: Immutable<PotentialUser>,
    redirect: boolean
) => async (dispatch: Dispatch<Action>) => {

    function showEmailChangeModal() {
        dispatch(openActiveModal({
            title: `Editing your email address`,
            body: <div>
                <p>
                    You have changed your account email address. This new email address won&#39;t be used until you click the verification link sent to it.
                    Until then, we will use the old email address and you will still need to use that when logging in by email and password.
                </p>
                <p> Would you like to continue? </p>
                <div className="w-100">
                    <Button
                        className={"float-start mb-4"}
                        color={siteSpecific("tertiary", "keyline")}
                        onClick={() => { cancelSettingsUpdate(); dispatch(closeActiveModal() as any); }}
                    >
                        Cancel
                    </Button>
                    <Button
                        className={"float-end mb-4"}
                        onClick={() => { continueSettingsUpdate(); dispatch(closeActiveModal() as any); }}
                    >
                        OK
                    </Button>
                </div>
            </div>
        }) as any);
    }

    function cancelSettingsUpdate() {
        dispatch(showToast({
            title: "Account settings not updated",
            body: "Your account settings update was cancelled.",
            color: "danger",
            timeout: 5000,
            closable: false,
        }) as any);
    }

    async function continueSettingsUpdate() {
        const editingOtherUser = currentUser.loggedIn && currentUser.id != updatedUser.id;

        try {
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST});
            const currentUser = await api.users.updateCurrent(updatedUser, updatedUserPreferences, passwordCurrent, userContexts);
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS, user: currentUser.data});

            await dispatch(requestCurrentUser() as any);

            if (!editingOtherUser) {
            // Invalidate tagged caches that are dependent on the current user's settings
                dispatch(questionsApi.util.invalidateTags(['CanAttemptQuestionType']) as any);
            }

            const isFirstLogin = isFirstLoginInPersistence() || false;
            if (isFirstLogin) {
                persistence.session.remove(KEY.FIRST_LOGIN);
                if (redirect) {
                    continueToAfterAuthPath({loggedIn: true, ...currentUser});
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
                if (redirect) {
                    history.push('/');
                }
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
    }

    // Confirm email change
    if (currentUser.loggedIn && currentUser.id == updatedUser.id && currentUser.email !== updatedUser.email) {
        showEmailChangeModal();
    } else {
        continueSettingsUpdate();
    }
};

export const getMyProgress = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.MY_PROGRESS_REQUEST});
    try {
        const response = await api.users.getProgress();
        dispatch({type: ACTION_TYPE.MY_PROGRESS_RESPONSE_SUCCESS, myProgress: response.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.MY_PROGRESS_RESPONSE_FAILURE});
    }
};

export const getUserProgress = (userIdOfInterest?: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PROGRESS_REQUEST});
    try {
        const response = await api.users.getProgress(userIdOfInterest);
        dispatch({type: ACTION_TYPE.USER_PROGRESS_RESPONSE_SUCCESS, userProgress: response.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_PROGRESS_RESPONSE_FAILURE});
    }
};

export const getSnapshot = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_SNAPSHOT_REQUEST});
    try {
        const response = await api.users.getSnapshot();
        dispatch({type: ACTION_TYPE.USER_SNAPSHOT_RESPONSE_SUCCESS, snapshot: response.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_SNAPSHOT_RESPONSE_FAILURE});
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

export const logOutDeletedUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_REQUEST});
    try {
        await api.authentication.logout();
        dispatch({type: ACTION_TYPE.USER_DELETION_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Logout failed", e));
    }
};

export const logInUser = (provider: AuthenticationProvider, credentials: CredentialsAuthDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_IN_REQUEST, provider});

    try {
        const result = await api.authentication.login(provider, credentials);

        if (result.status === 202) {
            // We haven't been fully authenticated, some additional action is required
            if (result.data.MFA_REQUIRED) {
                // MFA is required for this user and user isn't logged in yet.
                dispatch({type: ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUIRED});
                return;
            } else if (result.data.EMAIL_VERIFICATION_REQUIRED) {
                // Email verification is required for this user
                history.push("/verifyemail");
                // A partial login is still "successful", though we are unable to request user preferences and auth settings
                dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: result.data});
                // We can, however, request the current user. This lets us set the session expiry time.
                dispatch(requestCurrentUser() as any);
                return;
            }
        }
        // requestCurrentUser gives us extra information like auth settings, preferences and time until session expiry
        dispatch(requestCurrentUser() as any);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: result.data});
        continueToAfterAuthPath(result.data);
    } catch (e: any) {
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE, errorMessage: extractMessage(e)});
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
        trackEvent("sign_in_attempt", { props: { provider: provider.toLowerCase(), fromLinkPage: false } });
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
        trackEvent("sign_in_success", { props: { provider: provider.toLowerCase() }});
        if (providerResponse.data.firstLogin) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
            trackEvent("registration", {
                props: {
                    provider: provider,
                }
            });
        }

        // On first login (registration), redirect to /account if there is no after-auth path.
        // After-auth path should take presedence for the case where users register while following a group invite - /account?authToken=GROUP1, for example.
        // They will see the required account information modal either way on registration.
        const nextPage = persistence.pop(KEY.AFTER_AUTH_PATH);
        const defaultNextPage = providerResponse.data.firstLogin ? "/account" : "/";
        history.push(nextPage || defaultNextPage);
    } catch (error: any) {
        trackEvent("sign_in_failure", { props: {
            provider: provider.toLowerCase(),
            providerErrors: fetchErrorFromParameters(parameters),
            isaacErrors: {
                error: error?.response?.data?.responseCode || error?.code,
                errorDescription: error?.response?.data?.errorMessage || error?.message
            }
        }});
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
};

// Glossary Terms
export const fetchGlossaryTerms = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GLOSSARY_TERMS_REQUEST});
    try {
        const response = await api.glossary.getTerms();
        dispatch({type: ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_SUCCESS, terms: response.data.results as GlossaryTermDTO[]});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_FAILURE});
    }
};

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

export const attemptQuestion = (questionId: string, attempt: Immutable<ChoiceDTO>, questionType: string, gameboardId?: string, inlineContext?: ContextType<typeof InlineContext>) => async (dispatch: AppDispatch, getState: () => AppState) => {
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
        dispatch(questionsApi.util.invalidateTags([{ type: 'CanAttemptQuestionType', id: questionType }]));

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
        if (lastAttempt.attempts >= softLimit && !response.data.correct && (!inlineContext || inlineContext.canShowWarningToast)) {
            dispatch(showToast({
                color: "warning", title: "Approaching attempts limit", timeout: 10000,
                body: "You have entered several guesses for this question; soon it will be temporarily locked."
            }) as any);
            if (inlineContext) inlineContext.canShowWarningToast = false;
        }
    } catch (e: any) {
        if (inlineContext?.canShowWarningToast === false) return;
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
        if (inlineContext) inlineContext.canShowWarningToast = false;
    }
};

export function setCurrentAttempt<T extends ChoiceDTO>(questionId: string, attempt: Immutable<T | ValidatedChoice<T>>) {
    return (dispatch: Dispatch<Action>) => dispatch({
        type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT,
        questionId,
        attempt
    });
}

let questionSearchCounter = 0;

export const searchQuestions = (query: QuestionSearchQuery) => async (dispatch: Dispatch<Action>) => {
    const searchCount = ++questionSearchCounter;
    dispatch({type: ACTION_TYPE.QUESTION_SEARCH_REQUEST});
    try {
        const questionsResponse = await api.questions.search(query);
        // Because some searches might take longer to return that others, check this is the most recent search still.
        // Otherwise, we just discard the data.
        if (searchCount === questionSearchCounter) {
            dispatch({type: ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS, questionResults: questionsResponse.data});
        }
    } catch (e) {
        dispatch({type: ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE});
        dispatch(showAxiosErrorToastIfNeeded("Failed to search for questions", e));
    }
};

export const clearQuestionSearch = async (dispatch: Dispatch<Action>) => {
    questionSearchCounter++;
    dispatch({type: ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS, questionResults: {results: [], totalResults: 0}});
};

export const getMyAnsweredQuestionsByDate = (userId: number | string, fromDate: number, toDate: number, perDay: boolean) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_REQUEST});
    try {
        const myAnsweredQuestionsByDate = await api.questions.answeredQuestionsByDate(userId, fromDate, toDate, perDay);
        dispatch({type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS, myAnsweredQuestionsByDate: myAnsweredQuestionsByDate.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE});
        dispatch(showAxiosErrorToastIfNeeded("Failed to get my answered question activity data", e));
    }
};

export const getUserAnsweredQuestionsByDate = (userId: number | string, fromDate: number, toDate: number, perDay: boolean) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_REQUEST});
    try {
        const userAnsweredQuestionsByDate = await api.questions.answeredQuestionsByDate(userId, fromDate, toDate, perDay);
        dispatch({type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS, userAnsweredQuestionsByDate: userAnsweredQuestionsByDate.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_FAILURE});
        dispatch(showAxiosErrorToastIfNeeded("Failed to get user answered question activity data", e));
    }
};

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
                        dispatch(attemptQuestion(question.id, question.currentAttempt, question.type as string) as any);
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
        closeAction: () => {dispatch(closeActiveModal() as any);},
        title: "Test already submitted",
        body: <div className="text-center my-7 pb-4">
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

// Search
export const fetchSearch = (query: string, types: string | undefined) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.SEARCH_REQUEST, query, types});
    try {
        if (query === "") {
            return;
        }
        const searchResponse = await api.search.get(query, types);
        dispatch({type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS, searchResults: searchResponse.data});
    } catch (e) {
        dispatch(showAxiosErrorToastIfNeeded("Search failed", e));
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

export const continueToAfterAuthPath = (user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null) => {
    let target = "/";
    const pathOverride = persistence.pop(KEY.AFTER_AUTH_PATH);
    if (pathOverride) {
        target = pathOverride;
    } else if (user && isTeacherOrAbove(user) && isAda) {
        target = "/dashboard";
    }
    history.push(target);
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
