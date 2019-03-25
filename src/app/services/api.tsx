import axios from "axios";
import {API_PATH} from "./constants";

const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});
// TODO MT add middleware/interceptor to handle api exceptions sensibly

export const api = {
    users: {
        getCurrent: () => {
            return endpoint.get(`/users/current_user`);
        }
    },
    authentication: {
        getRedirect: (provider: string) => {
            return endpoint.get(`/auth/${provider}/authenticate`);
        },
        checkProviderCallback: (provider: string, params: any) => {
            return endpoint.get(`/auth/${provider}/callback${params}`);
        },
        logout: () => {
            return endpoint.post(`/auth/logout`);
        }
    },
    questions: {
        get: (id: string) => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        answer: (id: string, answer: object) => {
            return endpoint.post(`questions/${id}/answer`, answer);
        }
    }
};
