import axios from "axios";
import {API_PATH} from "../constants";

const endpoint = axios.create({
    baseURL: API_PATH,
});

export const api = {
    questions: {
        get: (id: string) => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        answer: (id: string, answer: object) => {
            return endpoint.post(`questions/${id}/answer`, answer);
        }

    }
};
