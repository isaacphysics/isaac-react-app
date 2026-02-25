import axios, {AxiosPromise} from "axios";
import {API_PATH, IMAGE_PATH, securePadCredentials, TAG_ID} from "./";
import * as ApiTypes from "../../IsaacApiTypes";
import {AuthenticationProvider, TestCaseDTO} from "../../IsaacApiTypes";
import * as AppTypes from "../../IsaacAppTypes";
import {Choice, CredentialsAuthDTO} from "../../IsaacAppTypes";
import {handleApiGoneAway, handleServerError} from "../state";
import {Immutable} from "immer";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

endpoint.interceptors.response.use((response) => {
    if (response.status >= 500) {
        console.warn("Uncaught error from API:", response);
    }
    return response;
}, (error) => {
    if (error.response && error.response.status >= 500 && !error.response.data.bypassGenericSiteErrorPage) {
        if (error.response.status == 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            handleApiGoneAway();
        } else {
            handleServerError();
        }
        console.warn("Error from API:", error);
    }
    return Promise.reject(error);
});

export const apiHelper = {
    determineImageUrl: (path: string) => {
        // Check if the image source is a fully qualified link (suggesting it is external to the Isaac site),
        // or else an asset link served by the APP, not the API. On the preview renderer only, also allow "data:"
        // in image sources, as the editor passes images to the renderer in a post message. 
        if ((path.indexOf("http") > -1) || (path.indexOf("/assets/") > -1) || (EDITOR_PREVIEW && path.indexOf("data:") > -1)) {
            return path;
        } else {
            return `${IMAGE_PATH}/${path}`;
        }
    }
};

export const api = {
    search: {
        get: (query: string, types: string | undefined): AxiosPromise<ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>> => {
            return endpoint.get(`/search`, {params: {query, types}});
        }
    },
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        },
        getPreferences: (): AxiosPromise<AppTypes.UserPreferencesDTO> => {
            return endpoint.get(`/users/user_preferences`);
        },
        passwordReset: (params: {email: string}) => {
            return endpoint.post(`/users/resetpassword`, params);
        },
        passwordResetById: (id: number) => {
            return endpoint.post(`/users/${id}/resetpassword`);
        },
        getProgress: (userIdOfInterest = "current_user"): AxiosPromise<AppTypes.UserProgress> => {
            return endpoint.get(`users/${userIdOfInterest}/progress`);
        },
        getSnapshot: (): AxiosPromise<AppTypes.UserSnapshot> => {
            return endpoint.get(`users/current_user/snapshot`);
        }
    },
    authentication: {
        getRedirect: (provider: ApiTypes.AuthenticationProvider, isSignup: boolean = false): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/authenticate`, {
                params: { signup: isSignup }
            });
        },
        checkProviderCallback: (provider: ApiTypes.AuthenticationProvider, params: string): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/callback${params}`);
        },
        logout: (): AxiosPromise => {
            return endpoint.post(`/auth/logout`);
        },
        logoutEverywhere: (): AxiosPromise => {
            return endpoint.post(`/auth/logout/everywhere`);
        },
        login: (provider: ApiTypes.AuthenticationProvider, credentials: CredentialsAuthDTO): AxiosPromise<ApiTypes.AuthenticationResponseDTO> => {
            return endpoint.post(`/auth/${provider}/authenticate`, securePadCredentials(credentials));
        },
        mfaCompleteLogin: (mfaVerificationCode : string, rememberMe: boolean): AxiosPromise => {
            return endpoint.post(`/auth/mfa/challenge`, {mfaVerificationCode: mfaVerificationCode, rememberMe});
        },
        getCurrentUserAuthSettings: (): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
            return endpoint.get(`/auth/user_authentication_settings`);
        },
        getSelectedUserAuthSettings: (userId: number): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
            return endpoint.get(`/auth/user_authentication_settings/${userId}`);
        },
        linkAccount: (provider: AuthenticationProvider): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/link`);
        },
        unlinkAccount: (provider: AuthenticationProvider): AxiosPromise => {
            return endpoint.delete(`/auth/${provider}/link`);
        },
    },
    notifications: {
        get: (): AxiosPromise => {
            return endpoint.get(`/notifications`);
        },
        respond: (id: string, response: string): AxiosPromise => {
            return endpoint.post(`/notifications/${id}/${response}`);
        }
    },
    glossary: {
        getTerms: (): AxiosPromise<ApiTypes.ResultsWrapper<ApiTypes.GlossaryTermDTO>> => {
            // FIXME: Magic number. This needs to go through pagination with
            // limit and start_index query parameters.
            return endpoint.get('/glossary/terms', {
                params: { limit: 10000 }
            });
        },
        getTermById: (id: string): AxiosPromise<ApiTypes.GlossaryTermDTO> => {
            return endpoint.get(`/glossary/terms/${id}`);
        }
    },
    questions: {
        answer: (id: string, answer: Immutable<ApiTypes.ChoiceDTO>): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/questions/${id}/answer`, answer);
        },
        answeredQuestionsByDate: (userId: number | string, fromDate: number, toDate: number, perDay: boolean): AxiosPromise<ApiTypes.AnsweredQuestionsByDate> => {
            return endpoint.get(`/questions/answered_questions/${userId}`, {
                params: {
                    "from_date": fromDate,
                    "to_date": toDate,
                    "per_day": perDay
                }
            });
        },
        testFreeTextQuestion: (userDefinedChoices: Choice[], testCases: TestCaseDTO[]) => {
            return endpoint.post("/questions/test?type=isaacFreeTextQuestion", {userDefinedChoices, testCases});
        }
    },
    topics: {
        get: (topicName: TAG_ID): AxiosPromise<ApiTypes.IsaacTopicSummaryPageDTO> => {
            return endpoint.get(`/pages/topics/${topicName}`);
        }
    },
    websockets: {
        userAlerts: (): WebSocket => {
            const userAlertsURI = "/user-alerts";
            if (API_PATH.indexOf("http") > -1) {
                // APP and API on separate domains, urlPrefix is full URL:
                return new WebSocket(API_PATH.replace(/^http/, "ws") + userAlertsURI);
            } else {
                // APP and API on same domain, need window.location.origin for full URL:
                return new WebSocket(window.location.origin.replace(/^http/, "ws") + API_PATH + userAlertsURI);
            }
        }
    },
    quizzes: {
        loadQuizAssignmentAttempt: (quizAssignmentId: number): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.post(`/quiz/assignment/${quizAssignmentId}/attempt`);
        },
        answer: (quizAttemptId: number, questionId: string, attempt: Immutable<ApiTypes.ChoiceDTO>): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/quiz/attempt/${quizAttemptId}/answer/${questionId}`, attempt);
        },
        loadFreeQuizAttempt: (quizId: string): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.post(`/quiz/${quizId}/attempt`);
        }
    },
};
