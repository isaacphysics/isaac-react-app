import {api} from "../services/api";
import {Dispatch} from "react";
import {AppState} from "./reducers";
import {history, redirectToPageNotFound} from "../services/history";
import {store} from "./store";
import {documentCache, topicCache} from "../services/cache";
import {
    ACTION_TYPE,
    API_REQUEST_FAILURE_MESSAGE,
    DOCUMENT_TYPE,
    MEMBERSHIP_STATUS,
    TAG_ID
} from "../services/constants";
import {
    Action,
    ActiveModal,
    ActualBoardLimit,
    AppGroup,
    AppGroupMembership,
    BoardOrder,
    LoggedInUser,
    LoggedInValidationUser,
    Toast,
    UserPreferencesDTO,
    ValidatedChoice,
} from "../../IsaacAppTypes";
import {
    AuthenticationProvider,
    ChoiceDTO,
    GameboardDTO,
    QuestionDTO,
    RegisteredUserDTO,
    Role,
    UserGroupDTO,
    UserSummaryDTO,
    UserSummaryWithEmailAddressDTO
} from "../../IsaacApiTypes";
import {
    releaseAllConfirmationModal,
    releaseConfirmationModal,
    revocationConfirmationModal,
    tokenVerificationModal
} from "../components/elements/TeacherConnectionModalCreators";
import * as persistance from "../services/localStorage";
import {groupInvitationModal, groupManagersModal} from "../components/elements/GroupsModalCreators";
import {ThunkDispatch} from "redux-thunk";
import {groups} from "./selectors";

// Toasts
const removeToast = (toastId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.TOASTS_REMOVE, toastId});
};

export const hideToast = (toastId: string) => (dispatch: any) => {
    dispatch({type: ACTION_TYPE.TOASTS_HIDE, toastId});
    setTimeout(() => {
        dispatch(removeToast(toastId));
    }, 1000);
};

let nextToastId = 0;
export const showToast = (toast: Toast) => (dispatch: any) => {
    const toastId = toast.id = "toast" + nextToastId++;
    if (toast.timeout) {
        setTimeout(() => {
            dispatch(hideToast(toastId));
        }, toast.timeout);
    }
    if (toast.closable === undefined) toast.closable = true;
    toast.showing = true;
    dispatch({type: ACTION_TYPE.TOASTS_SHOW, toast});
    return toastId;
};

function showErrorToastIfNeeded(error: string, e: any) {
    if (e) {
        if (e.response) {
            if (e.response.status < 500) {
                return showToast({
                    color: "danger", title: error, timeout: 5000,
                    body: e.response.data && e.response.data.errorMessage || API_REQUEST_FAILURE_MESSAGE
                }) as any;
            }
        } else {
            return showToast({
                color: "danger", title: error, timeout: 5000,
                body: API_REQUEST_FAILURE_MESSAGE
            });
        }
    }
    return {type: ACTION_TYPE.TEST_ACTION};
}


// ActiveModal
export const openActiveModal = (activeModal: ActiveModal) => ({type: ACTION_TYPE.ACTIVE_MODAL_OPEN, activeModal});

export const closeActiveModal = () => ({type: ACTION_TYPE.ACTIVE_MODAL_CLOSE});

// User Authentication
export const getUserAuthSettings = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_REQUEST});
    try {
        const authenticationSettings = await api.authentication.getCurrentUserAuthSettings();
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS, userAuthSettings: authenticationSettings.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const getUserPreferences = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PREFERENCES_REQUEST});
    try {
        const userPreferenceSettings = await api.users.getPreferences();
        dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS, userPreferences: userPreferenceSettings.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_UPDATE_REQUEST});
    try {
        // Request the user
        const currentUser = await api.users.getCurrent();
        // Now with that information request auth settings and preferences asynchronously
        await Promise.all([
            dispatch(getUserAuthSettings() as any),
            dispatch(getUserPreferences() as any)
        ]);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_UPDATE_RESPONSE_FAILURE});
    }
};

// TODO scope for pulling out a registerUser method from this
export const updateCurrentUser = (
    params: {registeredUser: LoggedInValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string | null},
    currentUser: LoggedInUser
) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_REQUEST});
    if (currentUser.loggedIn && params.registeredUser.loggedIn && currentUser.email !== params.registeredUser.email) {
        let emailChange = window.confirm("You have edited your email address. Your current address will continue to work until you verify your new address by following the verification link sent to it via email. Continue?");
        // TODO handle the alert with modal
        if (emailChange) {
            try {
                const changedUser = await api.users.updateCurrent(params);
                dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS, user: changedUser.data});
            } catch (e) {
                dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
            }
        } else {
            params.registeredUser.email = currentUser.email; // TODO I don't think you can do this, or even if so probably shouldn't
        }
    } else {
        const initialLogin = params.registeredUser.loggedIn && params.registeredUser.firstLogin || false;
        try {
            const currentUser = await api.users.updateCurrent(params);
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS, user: currentUser.data});
            if (initialLogin) {
                history.push('/account', {firstLogin: initialLogin});
            }
            dispatch(showToast({
                title: "Preferences updated",
                body: "Your user preferences were updated correctly.",
                color: "success",
                timeout: 5000,
                closable: false,
            }) as any);
        } catch (e) {
            dispatch({type: ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
        }
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_REQUEST});
    try {
        await api.authentication.logout();
        dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Logout Failed", e));
    }
};

export const logInUser = (provider: AuthenticationProvider, params: {email: string; password: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_LOG_IN_REQUEST, provider});
    try {
        const response = await api.authentication.login(provider, params);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
        history.push('/');
    } catch (e) {
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE, errorMessage: (e.response) ? e.response.data.errorMessage : API_REQUEST_FAILURE_MESSAGE})
    }
    dispatch(requestCurrentUser() as any)
};

export const resetPassword = (params: {email: string}) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST});
    try {
        await api.users.passwordReset(params);
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Reset Password Failed", e));
    }
};

export const verifyPasswordReset = (token: string | null) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_REQUEST});
        const response = await api.users.verifyPasswordReset(token);
        dispatch({type: ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const handlePasswordReset = (params: {token: string | null; password: string | null}) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST});
        const response = await api.users.handlePasswordReset(params);
        dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS});
        history.push('/');
    } catch(e) {
        dispatch({type:ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

export const handleProviderLoginRedirect = (provider: AuthenticationProvider) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT, provider});
    try {
        const redirectResponse = await api.authentication.getRedirect(provider);
        const redirectUrl = redirectResponse.data.redirectUrl;
        dispatch({type: ACTION_TYPE.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
        window.location.href = redirectUrl;
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Login Redirect Failed", e));
    }
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: AuthenticationProvider, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK});
    try {
        const response = await api.authentication.checkProviderCallback(provider, parameters);
        dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Login Failed", e));
    }
};

export const requestEmailVerification = () => async (dispatch: any, getState: () => AppState) => {
    const state = getState();
    const user: RegisteredUserDTO | null = state && state.user && state.user.loggedIn && state.user || null;
    let error = "";
    if (user && user.email) {
        dispatch({type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_REQUEST});
        try {
            const response = await api.users.requestEmailVerification({email: user.email});
            if (response.status == 200) {
                dispatch(showToast({
                    color: "success", title: "Email verification request succeeded.",
                    body: "Please follow the verification link given in the email sent to your address.",
                    timeout: 10000
                }));
                dispatch({type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_SUCCESS});
                return;
            }
            error = response.data || "Error sending request";
        } catch (e) {
            error = e.message || "Error sending request";
        }
    } else {
        error = "You are not logged in or don't have an e-mail address to verify.";
    }

    dispatch(showToast({color: "failure", title: "Email verification request failed.",
        body: "Sending an email to your address failed with error message: " + error
    }));
    dispatch({type: ACTION_TYPE.USER_REQUEST_EMAIL_VERIFICATION_RESPONSE_FAILURE});
};

export const handleEmailAlter = (params: ({userid: string | null; token: string | null})) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.EMAIL_AUTHENTICATION_REQUEST});
        await api.email.verify(params);
        dispatch({type: ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_SUCCESS});
        dispatch(requestCurrentUser() as any);
    } catch(e) {
        dispatch({type:ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

// Contact Us
export const submitMessage = (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_REQUEST});
    try {
        await api.contactForm.send(extra, params);
        dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_SUCCESS})
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_FAILURE, errorMessage: (e.response) ? e.response.data.errorMessage : API_REQUEST_FAILURE_MESSAGE})
        dispatch(showErrorToastIfNeeded("Message Not Sent", e));
    }
};

// Teacher Connections
export const getActiveAuthorisations = () => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_REQUEST});
        const authorisationsResponse = await api.authorisations.get();
        dispatch({
            type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS,
            authorisations: authorisationsResponse.data
        });
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Loading Authorised Teachers Failed", e));
    }
};

export const authenticateWithTokenAfterPrompt = (userSubmittedAuthenticationToken: string | null) => async (dispatch: Dispatch<Action>) => {
    if (!userSubmittedAuthenticationToken) {
        dispatch(showToast({color: "failure", title: "No Token Provided", body: "You have to enter a token!"}) as any);
        return;
    }

    try {
        // Some users paste the URL in the token box, so remove the token from the end if they do.
        // Tokens so far are also always uppercase; this is hardcoded in the API, so safe to assume here:
        let authenticationToken = userSubmittedAuthenticationToken.split("?authToken=").pop() as string;
        authenticationToken = authenticationToken.toUpperCase().replace(/ /g,'');

        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_REQUEST})
        const result = await api.authorisations.getTokenOwner(authenticationToken);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_RESPONSE_SUCCESS});
        const usersToGrantAccess = result.data;

        // TODO can use state (second thunk param) to highlight teachers who have already been granted access
        // const toGrantIds = usersToGrantAccess && usersToGrantAccess.map(u => u.id);
        // const state = getState();
        // const usersAlreadyAuthorised = (state && state.activeAuthorisations && state.activeAuthorisations
        //     .filter((currentAuthorisation) => (toGrantIds as number[]).includes(currentAuthorisation.id as number)));

        dispatch(openActiveModal(tokenVerificationModal(authenticationToken, usersToGrantAccess)) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_RESPONSE_FAILURE});
        if (e.status == 429) {
            dispatch(showToast({
                color: "danger", title: "Too Many Attempts", timeout: 5000,
                body: "You have entered too many tokens. Please check your code with your teacher and try again later!"
            }) as any);
        } else {
            dispatch(showToast({
                color: "danger", title: "Teacher Connection Failed", timeout: 5000,
                body: "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
            }) as any);
        }
    }
};
export const authenticateWithToken = (authToken: string) => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_REQUEST});
        await api.authorisations.useToken(authToken);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_SUCCESS});
        dispatch(getActiveAuthorisations() as any);
        dispatch(getMyGroupMemberships() as any);
        dispatch(showToast({
            color: "success", title: "Granted Access", timeout: 5000,
            body: "You have granted access to your data."
        }) as any);
        const state = getState();
        // user.firstLogin is set correctly using SSO, but not with Segue: check session storage too:
        if (state && state.user && state.user.loggedIn && state.user.firstLogin || persistance.load('firstLogin')) {
            // If we've just signed up and used a group code immediately, change back to the main settings page:
            history.push("/account");
        }
        dispatch(closeActiveModal() as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_FAILURE});
        dispatch(showToast({
            color: "danger", title: "Teacher Connection Failed", timeout: 5000,
            body: "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
        }) as any);
    }
};

export const revokeAuthorisationAfterPrompt = (user: UserSummaryWithEmailAddressDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(revocationConfirmationModal(user)) as any);
};
export const revokeAuthorisation = (userToRevoke: UserSummaryWithEmailAddressDTO) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_REQUEST});
        await api.authorisations.revoke(userToRevoke.id as number);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_SUCCESS});
        dispatch(showToast({
            color: "success", title: "Access Revoked", timeout: 5000,
            body: "You have revoked access to your data."
        }) as any)
        dispatch(getActiveAuthorisations() as any);
        dispatch(closeActiveModal() as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Revoke Operation Failed", e));
    }
};

// Student/Other Connections
export const getStudentAuthorisations = () => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_REQUEST});
        const otherUserAuthorisationsResponse = await api.authorisations.getOtherUsers();
        dispatch({
            type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_RESPONSE_SUCCESS,
            otherUserAuthorisations: otherUserAuthorisationsResponse.data
        });
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_OTHER_USERS_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Loading Authorised Students Failed", e));
    }
};

export const releaseAuthorisationAfterPrompt = (student: UserSummaryDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(releaseConfirmationModal(student)) as any);
};
export const releaseAuthorisation = (student: UserSummaryDTO) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_REQUEST});
        await api.authorisations.release(student.id as number);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_RESPONSE_SUCCESS});
        dispatch(getStudentAuthorisations() as any);
        dispatch(closeActiveModal() as any);
        dispatch(showToast({
            color: "success", title: "Access Removed", timeout: 5000,
            body: "You have ended your access to your student's data."
        }) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_USER_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Revoke Operation Failed", e));
    }
};

export const releaseAllAuthorisationsAfterPrompt = () => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(releaseAllConfirmationModal()) as any);
};
export const releaseAllAuthorisations = () => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_REQUEST});
        await api.authorisations.releaseAll();
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_SUCCESS});
        dispatch(getStudentAuthorisations() as any);
        dispatch(closeActiveModal() as any);
        dispatch(showToast({
            color: "success", title: "Access Removed", timeout: 5000,
            body: "You have ended your access to all of your students' data."
        }) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_RELEASE_ALL_USERS_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Revoke Operation Failed", e));
    }
};

// Constants
export const requestConstantsUnits = () => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Don't request this again if it has already been fetched successfully
    const state = getState();
    if (state && state.constants && state.constants.units) {
        return;
    }

    dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_REQUEST});
    try {
        const units = await api.constants.getUnits();
        dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS, units: units.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_FAILURE});
    }
};

export const requestConstantsSegueVersion = () => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    // Don't request this again if it has already been fetched successfully
    const state = getState();
    if (state && state.constants && state.constants.segueVersion) {
        return;
    }
    dispatch({type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_REQUEST});
    try {
        const version = await api.constants.getSegueVersion();
        dispatch({type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS, ...version.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_FAILURE});
    }
};

// Document & Topic Fetch
export const fetchDoc = (documentType: DOCUMENT_TYPE, pageId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.DOCUMENT_REQUEST, documentType: documentType, documentId: pageId});
    const cachedDocument = documentCache[documentType][pageId];
    if (cachedDocument) {
        dispatch({type: ACTION_TYPE.DOCUMENT_CACHE_SUCCESS, doc: cachedDocument});
    } else {
        let apiEndpoint;
        switch (documentType) {
            case DOCUMENT_TYPE.CONCEPT: apiEndpoint = api.concepts; break;
            case DOCUMENT_TYPE.QUESTION: apiEndpoint = api.questions; break;
            case DOCUMENT_TYPE.GENERIC: default: apiEndpoint = api.pages; break;
        }
        try {
            const response = await apiEndpoint.get(pageId);
            dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
            documentCache[documentType][pageId] = response.data;
        } catch (e) {
            dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE});
        }
    }
};

export const fetchTopicSummary = (topicName: TAG_ID) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.TOPIC_REQUEST, topicName});
    const cachedTopic = topicCache[topicName];
    if (cachedTopic) {
        dispatch({type: ACTION_TYPE.TOPIC_CACHE_SUCCESS, topic: cachedTopic});
    } else {
        try {
            const response = await api.topics.get(topicName);
            dispatch({type: ACTION_TYPE.TOPIC_RESPONSE_SUCCESS, topic: response.data});
            topicCache[topicName] = response.data;
        } catch (e) {
            dispatch({type: ACTION_TYPE.TOPIC_RESPONSE_FAILURE});
            redirectToPageNotFound(); // FIXME: This could do with similar 404 handling to pages
        }
    }
};

// Page fragments
export const fetchFragment = (id: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.FRAGMENT_REQUEST, id});
    try {
        const response = await api.fragments.get(id);
        dispatch({type: ACTION_TYPE.FRAGMENT_RESPONSE_SUCCESS, id, doc: response.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.FRAGMENT_RESPONSE_FAILURE, id});
    }
};


// Questions
export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionId});
};

interface Attempt {
    attempts: number;
    timestamp: number;
}
const attempts: {[questionId: string]: Attempt} = {};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    const state = getState();
    const isAnonymous = !(state && state.user && state.user.loggedIn);
    const timePeriod = isAnonymous ? 5 * 60 * 1000 : 15 * 60 * 1000;

    try {
        dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
        const response = await api.questions.answer(questionId, attempt);
        dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});

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
                color: "warning", title: "Approaching Attempts Limit", timeout: 10000,
                body: "You have entered several guesses for this question; soon it will be temporarily locked."
            }) as any);
        }
    } catch (e) {
        if (e.response.status == 429) {
            const lock = new Date((new Date()).getTime() + timePeriod);

            dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE, questionId, lock});
            dispatch(showToast({
                color: "danger", title: "Too Many Attempts", timeout: 10000,
                body: "You have entered too many attempts for this question. Please try again later!"
            }) as any);
            setTimeout( () => {
                dispatch({type: ACTION_TYPE.QUESTION_UNLOCK, questionId});
            }, timePeriod);
        } else {
            dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE, questionId});
            dispatch(showToast({
                color: "danger", title: "Question Attempt Failed", timeout: 5000,
                body: "Your submission could not be processed. Please try again."
            }) as any);
        }
    }
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO|ValidatedChoice<ChoiceDTO>) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};

// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GAMEBOARD_REQUEST, gameboardId});
    try {
        // TODO MT handle local storage load if gameboardId == null
        // TODO MT handle requesting new gameboard if local storage is also null
        if (gameboardId) {
            const gameboardResponse = await api.gameboards.get(gameboardId);
            dispatch({type: ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
        }
    } catch (e) {
        dispatch({type: ACTION_TYPE.GAMEBOARD_RESPONSE_FAILURE, gameboardId});
    }
};

// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
    // Generic error handling covers errors here
};

// Content version
export const getContentVersion = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_REQUEST});
    try {
        const version = await api.contentVersion.getLiveVersion();
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS, ...version.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Failed to get Content Version", e));
    }
};

export const setContentVersion = (version: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_REQUEST, version});
    try {
        await api.contentVersion.setLiveVersion(version);
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_SUCCESS, newVersion: version});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE});
    }
};

// Search
export const fetchSearch = (query: string, types: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.SEARCH_REQUEST, query, types});
    try {
        if (query === "") {
            return;
        }
        const searchResponse = await api.search.get(query, types);
        dispatch({type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS, searchResults: searchResponse.data});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Search Failed", e));
    }
};

// Admin
export const adminUserSearch = (queryParams: {}) => async (dispatch: Dispatch<Action|((d: Dispatch<Action>) => void)>) => {
    dispatch({type: ACTION_TYPE.ADMIN_USER_SEARCH_REQUEST});
    try {
        const searchResponse = await api.admin.userSearch.get(queryParams);
        dispatch({type: ACTION_TYPE.ADMIN_USER_SEARCH_RESPONSE_SUCCESS, users: searchResponse.data});
        const resultElement = window.document.getElementById("admin-search-results");
        if (resultElement) {
            resultElement.scrollIntoView({behavior: "smooth"});
        }
    } catch (e) {
        dispatch({type: ACTION_TYPE.ADMIN_USER_SEARCH_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("User Search Failed", e));
    }
};

export const adminModifyUserRoles = (role: Role, userIds: number[]) => async (dispatch: Dispatch<Action|((d: Dispatch<Action>) => void)>) => {
    dispatch({type: ACTION_TYPE.ADMIN_MODIFY_ROLES_REQUEST});
    try {
        await api.admin.modifyUserRoles.post(role, userIds);
        dispatch({type: ACTION_TYPE.ADMIN_MODIFY_ROLES_RESPONSE_SUCCESS});
    } catch (e) {
        dispatch({type: ACTION_TYPE.ADMIN_MODIFY_ROLES_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("User Role Modification Failed", e));
    }
};

// Groups

export const loadGroups = (archivedGroupsOnly: boolean) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_REQUEST});
    try {
        const groups = await api.groups.get(archivedGroupsOnly);
        dispatch({type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS, groups: groups.data, archivedGroupsOnly});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading Groups Failed", e));
    }
};

export const selectGroup = (group: UserGroupDTO | null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_SELECT, group});
};

export const createGroup = (groupName: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_CREATE_REQUEST});
    try {
        const newGroup = await api.groups.create(groupName);
        dispatch({type: ACTION_TYPE.GROUPS_CREATE_RESPONSE_SUCCESS, newGroup: newGroup.data});
        return newGroup.data as AppGroup;
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Creating a Group Failed", e));
        throw e;
    }
};

export const deleteGroup = (group: UserGroupDTO) => async (dispatch: Dispatch<any>) => {
    dispatch({type: ACTION_TYPE.GROUPS_DELETE_REQUEST});
    try {
        await api.groups.delete(group);
        dispatch({type: ACTION_TYPE.GROUPS_DELETE_RESPONSE_SUCCESS, deletedGroup: group});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_DELETE_RESPONSE_FAILURE, deletedGroup: group});
        dispatch(showErrorToastIfNeeded("Deleting a Group Failed", e));
    }
};

export const updateGroup = (updatedGroup: UserGroupDTO, message?: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_UPDATE_REQUEST});
    try {
        await api.groups.update(updatedGroup);
        dispatch({type: ACTION_TYPE.GROUPS_UPDATE_RESPONSE_SUCCESS, updatedGroup: updatedGroup});
        dispatch(showToast({color: "success", title: "Group saved successfully", body: message, timeout: 3000}) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_UPDATE_RESPONSE_FAILURE, updatedGroup: updatedGroup});
        dispatch(showErrorToastIfNeeded("Group Saving Failed", e));
    }
};

export const getGroupMembers = (group: UserGroupDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_REQUEST, group});
    try {
        const result = await api.groups.getMembers(group);
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS, group: group, members: result.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_FAILURE, group: group});
        dispatch(showErrorToastIfNeeded("Loading Group Members Failed", e));
    }
};

export const getGroupToken = (group: AppGroup) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_TOKEN_REQUEST, group});
    try {
        const result = await api.authorisations.getToken(group.id as number);
        dispatch({type: ACTION_TYPE.GROUPS_TOKEN_RESPONSE_SUCCESS, group: group, token: result.data.token});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_TOKEN_RESPONSE_FAILURE, group: group});
        dispatch(showErrorToastIfNeeded("Loading Group Token Failed", e));
    }
};

export const getGroupInfo = (group: AppGroup) => async (dispatch: ThunkDispatch<AppState, void, Action>) => {
    dispatch(getGroupMembers(group));
    dispatch(getGroupToken(group));
};

export const resetMemberPassword = (member: AppGroupMembership) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_REQUEST, member});
    try {
        await api.users.passwordResetById(member.groupMembershipInformation.userId as number);
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_SUCCESS, member});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_RESET_PASSWORD_RESPONSE_FAILURE, member});
        dispatch(showErrorToastIfNeeded("Failed to send password reset", e));
    }
};

export const deleteMember = (member: AppGroupMembership) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_REQUEST, member});
    try {
        await api.groups.deleteMember(member);
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS, member});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_FAILURE, member});
        dispatch(showErrorToastIfNeeded("Failed to delete member", e));
    }
};

export const addGroupManager = (group: AppGroup, managerEmail: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MANAGER_ADD_REQUEST, group, managerEmail});
    try {
        const result = await api.groups.addManager(group, managerEmail);
        dispatch({type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_SUCCESS, group, managerEmail, newGroup: result.data});
        return true;
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_FAILURE, group, managerEmail});
        dispatch(showErrorToastIfNeeded("Group Manager Addition Failed", e));
        return false;
    }
};

export const deleteGroupManager = (group: AppGroup, manager: UserSummaryWithEmailAddressDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUPS_MANAGER_DELETE_REQUEST, group, manager});
    try {
        await api.groups.deleteManager(group, manager);
        dispatch({type: ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS, group, manager});
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_FAILURE, group, manager});
        dispatch(showErrorToastIfNeeded("Group Manager Removal Failed", e));
    }
};

export const showGroupInvitationModal = (firstTime: boolean) => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(groupInvitationModal(firstTime)) as any);
};

export const showGroupManagersModal = () => async (dispatch: Dispatch<Action>, getState: () => AppState) => {
    const state = getState();
    const group = groups.current(state);
    const user = state && state.user && state.user.loggedIn && state.user || null;
    const userIsOwner = group && user && group.ownerId == user.id || false;
    dispatch(openActiveModal(groupManagersModal(userIsOwner)) as any);
};

export const getMyGroupMemberships = () => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_REQUEST});
        const groupMembershipsResponse = await api.groups.getMyMemberships();
        dispatch({
            type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_SUCCESS,
            groupMemberships: groupMembershipsResponse.data
        });
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUP_GET_MEMBERSHIPS_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Loading Group Memberships Failed", e));
    }
};

export const changeMyMembershipStatus = (groupId: number, newStatus: MEMBERSHIP_STATUS) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_REQUEST});
        await api.groups.changeMyMembershipStatus(groupId, newStatus);
        dispatch({type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_SUCCESS, groupId, newStatus});
        dispatch(showToast({
            color: "success", title: "Status Updated", timeout: 5000,
            body: "You have updated your membership status."
        }) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.GROUP_CHANGE_MEMBERSHIP_STATUS_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Membership Status Update Failed", e));
    }
};

// boards

export const loadBoards = (startIndex: number, limit: ActualBoardLimit, sort: BoardOrder) => async (dispatch: Dispatch<Action>) => {
    const accumulate = startIndex != 0;
    dispatch({type: ACTION_TYPE.BOARDS_REQUEST, accumulate});
    try {
        const boards = await api.boards.get(startIndex, limit, sort);
        dispatch({type: ACTION_TYPE.BOARDS_RESPONSE_SUCCESS, boards: boards.data, accumulate});
    } catch (e) {
        dispatch(showErrorToastIfNeeded("Loading Gameboards Failed", e));
    }
};

export const loadGroupsForBoard = (board: GameboardDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.BOARDS_GROUPS_REQUEST, board});
    try {
        const result = await api.boards.getGroupsForBoard(board);
        dispatch({type: ACTION_TYPE.BOARDS_GROUPS_RESPONSE_SUCCESS, board, groups: result.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.BOARDS_GROUPS_RESPONSE_FAILURE, board});
        dispatch(showErrorToastIfNeeded("Loading Groups for Gameboard Failed", e));
    }
};

export const deleteBoard = (board: GameboardDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.BOARDS_DELETE_REQUEST, board});
    try {
        await api.boards.delete(board);
        dispatch({type: ACTION_TYPE.BOARDS_DELETE_RESPONSE_SUCCESS, board});
        dispatch(showToast({color: "success", title: "Gameboard Deleted", body: "You have deleted gameboard " + board.title, timeout: 5000}) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.BOARDS_DELETE_RESPONSE_FAILURE, board});
        dispatch(showErrorToastIfNeeded("Delete Gameboard Failed", e));
    }
};

export const unassignBoard = (board: GameboardDTO, group: UserGroupDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.BOARDS_UNASSIGN_REQUEST, board, group});
    try {
        await api.boards.unassign(board, group);
        dispatch({type: ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_SUCCESS, board, group});
        dispatch(showToast({color: "success", title: "Assignment Deleted", body: "This assignment has been unset successfully.", timeout: 5000}) as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_FAILURE, board, group});
        dispatch(showErrorToastIfNeeded("Unassign Gameboard Failed", e));
    }
};

export const assignBoard = (board: GameboardDTO, groupId?: number, dueDate?: Date) => async (dispatch: Dispatch<Action>) => {
    if (groupId == null) {
        dispatch(showToast({color: "failure", title: "Board Assignment Failed", body: "Error: Please choose a group.", timeout: 5000}) as any);
        return false;
    }

    let dueDateUTC = undefined;
    if (dueDate != undefined) {
        dueDateUTC = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if ((dueDateUTC - today.valueOf()) < 0) {
            dispatch(showToast({color: "failure", title: "Board Assignment Failed", body: "Error: Due date cannot be in the past.", timeout: 5000}) as any);
            return false;
        }
    }

    const assignment = {board, groupId, dueDate: dueDateUTC};

    dispatch({type: ACTION_TYPE.BOARDS_ASSIGN_REQUEST, ...assignment});
    try {
        await api.boards.assign(board, groupId, dueDateUTC);
        dispatch({type: ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_SUCCESS, ...assignment});
        dispatch(showToast({color: "success", title: "Assignment Saved", body: "This assignment has been saved successfully.", timeout: 5000}) as any);
        return true;
    } catch (e) {
        dispatch({type: ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_FAILURE, ...assignment});
        dispatch(showErrorToastIfNeeded("Gameboard Assignment Failed", e));
        return false;
    }
};

// Content Errors
export const getAdminContentErrors = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.ADMIN_CONTENT_ERRORS_REQUEST});
    try {
        const errorsResponse = await api.admin.getContentErrors();
        dispatch({type: ACTION_TYPE.ADMIN_CONTENT_ERRORS_RESPONSE_SUCCESS, errors: errorsResponse.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.ADMIN_CONTENT_ERRORS_RESPONSE_FAILURE});
        dispatch(showErrorToastIfNeeded("Loading Content Errors Failed", e));
    }
};

// Generic log action:
export const logAction = (eventDetails: object) => {
    api.logger.log(eventDetails); // We do not care whether this completes or not
    return {type: ACTION_TYPE.LOG_EVENT, eventDetails: eventDetails};
};

// SERVICE ACTIONS (w/o dispatch)
// Page change
export const changePage = (path: string) => {
    store.dispatch({type: ACTION_TYPE.ROUTER_PAGE_CHANGE, path});
};

export const handleServerError = () => {
    store.dispatch({type: ACTION_TYPE.API_SERVER_ERROR});
    history.push("/error");
};

export const handleApiGoneAway = () => {
    store.dispatch({type: ACTION_TYPE.API_GONE_AWAY});
    history.push("/error_stale");
};
