import {api} from "../services/api";
import {Dispatch} from "react";
import {activeAuthorisations, AppState} from "./reducers";
import {history, redirectToPageNotFound} from "../services/history";
import {store} from "./store";
import {documentCache, topicCache} from "../services/cache";
import {ACTION_TYPE, API_REQUEST_FAILURE_MESSAGE, DOCUMENT_TYPE, TAG_ID} from "../services/constants";
import {
    Action,
    ActiveModal,
    LoggedInUser,
    LoggedInValidationUser,
    Toast,
    UserPreferencesDTO,
    ValidatedChoice,
} from "../../IsaacAppTypes";
import {
    AuthenticationProvider,
    ChoiceDTO,
    QuestionDTO,
    RegisteredUserDTO,
    UserSummaryWithEmailAddressDTO
} from "../../IsaacApiTypes";
import {
    revocationConfirmationModal,
    tokenVerificationModal
} from "../components/elements/TeacherConnectionModalCreators";

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
                history.push('/');
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
    const response = await api.authentication.logout();
    dispatch({type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
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
    const response = await api.users.passwordReset(params);
    dispatch({type: ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_SUCCESS});
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
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ACTION_TYPE.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: AuthenticationProvider, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, parameters);
    dispatch({type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT handle error case
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
        const response = await api.email.verify(params);
        dispatch({type: ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_SUCCESS});
    } catch(e) {
        dispatch({type:ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_FAILURE, errorMessage: e.response.data.errorMessage});
    }
};

// Contact Us
export const submitMessage = (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_REQUEST});
    try {
        const response = await api.contactForm.send(extra, params);
        dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_SUCCESS})
    } catch(e) {
        dispatch({type: ACTION_TYPE.CONTACT_FORM_SEND_RESPONSE_FAILURE, errorMessage: (e.response) ? e.response.data.errorMessage : API_REQUEST_FAILURE_MESSAGE})
    }
};

// User Connections
export const getActiveAuthorisations = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_REQUEST});
    try {
        const authorisationsResponse = await api.authorisations.get();
        dispatch({
            type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_SUCCESS,
            authorisations: authorisationsResponse.data
        });
    } catch {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_ACTIVE_RESPONSE_FAILURE});
    }
};

export const getGroupMembership = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GROUP_GET_MEMBERSHIP_REQUEST});
    try {
        const groupMembershipResponse = await api.groupManagement.getMyMembership();
        dispatch({
            type: ACTION_TYPE.GROUP_GET_MEMBERSHIP_RESPONSE_SUCCESS,
            groupMembership: groupMembershipResponse.data
        });
    } catch {
        dispatch({type: ACTION_TYPE.GROUP_GET_MEMBERSHIP_RESPONSE_FAILURE});
    }
};

export const processAuthenticationToken = (userSubmittedAuthenticationToken: string | null) => async (dispatch: Dispatch<Action>) => {
    if (!userSubmittedAuthenticationToken) {
        dispatch(showToast({color: "failure", title: "No Token Provided", body: "You have to enter a token!"}) as any);
        return;
    }

    // Some users paste the URL in the token box, so remove the token from the end if they do.
    // Tokens so far are also always uppercase; this is hardcoded in the API, so safe to assume here:
    let authenticationToken = userSubmittedAuthenticationToken.split("?authToken=").pop() as string;
    authenticationToken = authenticationToken.toUpperCase().replace(/ /g,'');

    dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_OWNER_REQUEST})
    try {
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
                color: "danger", title: "Too Many Attempts",
                body: "You have entered too many tokens. Please check your code with your teacher and try again later!"
            }) as any);
        } else {
            dispatch(showToast({
                color: "danger", title: "Teacher Connection Failed",
                body: "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
            }) as any);
        }
    }
};

export const applyToken = (authToken: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_REQUEST});
    try {
        await api.authorisations.useToken(authToken);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_SUCCESS});
        dispatch(getActiveAuthorisations() as any);
        dispatch(getGroupMembership() as any);
        //     $scope.authenticationToken = {value: null}; // could be done with a history push but might lose other info
        dispatch(showToast({color: "success", title: "Granted Access", body: "You have granted access to your data."}) as any);
        // TODO handle firstLogin redirect
        //     // user.firstLogin is set correctly using SSO, but not with Segue: check session storage too:
        //     if ($scope.user.firstLogin || persistence.session.load('firstLogin')) {
        //         // If we've just signed up and used a group code immediately, change back to the main settings page:
        //         $scope.activeTab = 0;
        //     }
        dispatch(closeActiveModal() as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_TOKEN_APPLY_RESPONSE_FAILURE});
        dispatch(showToast({
            color: "danger", title: "Teacher Connection Failed",
            body: "The code may be invalid or the group may no longer exist. Codes are usually uppercase and 6-8 characters in length."
        }) as any);
    }
};

export const processRevocation = (user: UserSummaryWithEmailAddressDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch(openActiveModal(revocationConfirmationModal(user)) as any);
};

export const revokeAuthorisation = (userToRevoke: UserSummaryWithEmailAddressDTO) => async (dispatch: Dispatch<Action>) => {
    try {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_REQUEST});
        await api.authorisations.revoke(userToRevoke.id as number);
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_SUCCESS});
        dispatch(showToast({
            color: "success", title: "Access Revoked", body: "You have revoked access to your data."
        }) as any)
        dispatch(getActiveAuthorisations() as any);
        dispatch(closeActiveModal() as any);
    } catch (e) {
        dispatch({type: ACTION_TYPE.AUTHORISATIONS_REVOKE_RESPONSE_FAILURE});
        dispatch(showToast({
            color: "danger", title: "Revoke Operation Failed",
            body: "With error message (" + e.status + ") " + e.data.errorMessage != undefined ? e.data.errorMessage : ""
        }) as any)
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
            case DOCUMENT_TYPE.FRAGMENT: apiEndpoint = api.fragments; break;
            case DOCUMENT_TYPE.GENERIC: default: apiEndpoint = api.pages; break;
        }
        try {
            const response = await apiEndpoint.get(pageId);
            dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
            documentCache[documentType][pageId] = response.data;
        } catch (e) {
            dispatch({type: ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE});
            redirectToPageNotFound();
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
            redirectToPageNotFound();
        }
    }
};

// Questions
export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO|ValidatedChoice<ChoiceDTO>) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};

// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};

// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};

// Content version
export const getContentVersion = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_REQUEST});
    try {
        const version = await api.contentVersion.getLiveVersion();
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_SUCCESS, ...version.data});
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_GET_RESPONSE_FAILURE});
    }
};

export const setContentVersion = (version: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_REQUEST, version});
    try {
        const result = await api.contentVersion.setLiveVersion(version);
        if (result.status == 200) {
            dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_SUCCESS, newVersion: version});
        } else {
            dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE});
        }
    } catch (e) {
        dispatch({type: ACTION_TYPE.CONTENT_VERSION_SET_RESPONSE_FAILURE});
    }
};

// Search
export const fetchSearch = (query: string, types: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.SEARCH_REQUEST, query, types});
    if (query === "") {
        return;
    }
    const searchResponse = await api.search.get(query, types);
    dispatch({type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS, searchResults: searchResponse.data});
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
