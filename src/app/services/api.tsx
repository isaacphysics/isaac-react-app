import axios, {AxiosPromise, AxiosResponse} from "axios";
import {API_PATH} from "./constants";
import {ChoiceDTO} from "../../IsaacApiTypes";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

// TODO MT do something sensible with errors
// endpoint.interceptors.response.use(
//     (response: AxiosResponse): AxiosResponse => {
//         return response
//     },
//     (error: AxiosPromise): AxiosPromise => {
//         console.log("Error returned as a response", error);
//         return error
//     }
// );

export const api = {
    users: {
        getCurrent: (): AxiosPromise => {
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
        get: (id: string): AxiosPromise => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        answer: (id: string, answer: ChoiceDTO): AxiosPromise => {
            return endpoint.post(`questions/${id}/answer`, answer);
        }
    },
    gameboards: {
        get: (gameboardId: string): AxiosPromise => {
            return endpoint.get(`/gameboards/${gameboardId}`);
        }
    },
    assignments: {
        getMyAssignments: (): AxiosPromise => {
            return endpoint.get(`/assignments`);
        }
    }
};
