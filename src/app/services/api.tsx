import axios, {AxiosPromise} from "axios";
import {API_PATH, TAG_ID} from "./constants";
import * as ApiTypes from "../../IsaacApiTypes";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

export const api = {
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        },
        getPreferences: (): AxiosPromise<ApiTypes.userPreferences> => {
            return endpoint.get(`users/user_preferences`)
        },
        passwordReset: (params: {email: string}): AxiosPromise => {
            return endpoint.post(`/users/resetpassword`, params);
        },
        verifyPasswordReset: (token: string | null): AxiosPromise => {
            return endpoint.get(`/users/resetpassword/${token}`)
        },
        handlePasswordReset: (params: {token: string | null, password: string | null}): AxiosPromise => {
            return endpoint.post(`/users/resetpassword/${params.token}`, {password: params.password})
        },
        updateCurrent: (params: {registeredUser: RegisteredUserDTO; passwordCurrent: string}):  AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.post(`/users`, params);
        }
    },
    authentication: {
        getRedirect: (provider: ApiTypes.AuthenticationProvider): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/authenticate`);
        },
        checkProviderCallback: (provider: ApiTypes.AuthenticationProvider, params: string): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/callback${params}`);
        },
        logout: (): AxiosPromise => {
            return endpoint.post(`/auth/logout`);
        },
        login: (provider: ApiTypes.AuthenticationProvider, params: {email: string; password: string}): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.post(`/auth/${provider}/authenticate`, params);
        }
    },
    email: {
        verifyEmail: (params: {userId: string | null, token: string | null}): AxiosPromise => {
            return endpoint.get(`/users/verifyemail/${params.userId}/${params.token}`);
        }
    },
    questions: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacQuestionPageDTO> => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        answer: (id: string, answer: ApiTypes.ChoiceDTO): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/questions/${id}/answer`, answer);
        }
    },
    concepts: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/concepts/${id}`);
        },
    },
    topics: {
        get: (topicName: TAG_ID): AxiosPromise<ApiTypes.IsaacTopicSummaryPageDTO> => {
            return endpoint.get(`/pages/topics/${topicName}`);
        }
    },
    gameboards: {
        get: (gameboardId: string): AxiosPromise<ApiTypes.GameboardDTO> => {
            return endpoint.get(`/gameboards/${gameboardId}`);
        }
    },
    assignments: {
        getMyAssignments: (): AxiosPromise<ApiTypes.AssignmentDTO[]> => {
            return endpoint.get(`/assignments`);
        }
    },
    constants: {
        getUnits: (): AxiosPromise<string[]> => {
            return endpoint.get(`/content/units`)
        }
    }
};
