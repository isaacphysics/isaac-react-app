import axios from "axios";

const API_PATH = "http://localhost:8080/isaac-api/api";

const endpoint = axios.create({
    baseURL: API_PATH,
});

export const api = {
    question: (id: string) => {
        return endpoint.get("/pages/questions/" + id);
    }
};
