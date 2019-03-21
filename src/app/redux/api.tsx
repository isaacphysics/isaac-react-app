import axios from "axios";
import {API_PATH} from "../constants";

const endpoint = axios.create({
    baseURL: API_PATH,
});

export const api = {
    question: (id: string) => {
        return endpoint.get(`/pages/questions/${id}`);
    }
};
