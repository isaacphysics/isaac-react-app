import axios, {AxiosPromise} from "axios";
import {API_PATH, TAG_ID} from "./constants";
import * as ApiTypes from "../../IsaacApiTypes";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

export const api = {
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        },
        passwordReset: (params: {email: string}): AxiosPromise => {
            return endpoint.post(`/users/resetpassword`, params);
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
    pages: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/${id}`);
        },
    },
    fragments: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/fragments/${id}`);
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
