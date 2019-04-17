import axios, {AxiosPromise, AxiosResponse} from "axios";
import {API_PATH, TOPICS} from "./constants";
import * as ApiTypes from "../../IsaacApiTypes";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

export const api = {
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        }
    },
    authentication: {
        getRedirect: (provider: string): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/authenticate`);
        },
        checkProviderCallback: (provider: string, params: string): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/callback${params}`);
        },
        logout: (): AxiosPromise => {
            return endpoint.post(`/auth/logout`);
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
    // topics: {
    //     get: (topicName: string): AxiosPromise<TopicDTO> => {
    //         return endpoint.get(`/topics/${topicName}`);
    //     }
    // },
    gameboards: {
        get: (gameboardId: string): AxiosPromise<ApiTypes.GameboardDTO> => {
            return endpoint.get(`/gameboards/${gameboardId}`);
        }
    },
    assignments: {
        getMyAssignments: (): AxiosPromise<ApiTypes.AssignmentDTO[]> => {
            return endpoint.get(`/assignments`);
        }
    }
};
