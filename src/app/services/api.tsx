import axios from "axios";
import {API_PATH} from "./constants";

const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

export const api = {
    users: {
        getCurrent: () => {
            return endpoint.get(`/users/current_user`);
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
