import axios, {AxiosPromise} from "axios";
import {
    API_PATH,
    IMAGE_PATH,
    securePadCredentials,
    securePadPasswordReset,
    TAG_ID
} from "./";
import * as ApiTypes from "../../IsaacApiTypes";
import {
    AuthenticationProvider,
    ResultsWrapper,
    TestCaseDTO,
    UserContext
} from "../../IsaacApiTypes";
import * as AppTypes from "../../IsaacAppTypes";
import {
    Choice,
    Concepts,
    CredentialsAuthDTO,
    QuestionSearchQuery,
    QuestionSearchResponse,
    UserPreferencesDTO,
    ValidationUser
} from "../../IsaacAppTypes";
import {handleApiGoneAway, handleServerError} from "../state";
import {Immutable} from "immer";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

endpoint.interceptors.response.use((response) => {
    if (response.status >= 500) {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.warn("Error from API:", error);
    }
    return Promise.reject(error);
});

export const apiHelper = {
    determineImageUrl: (path: string) => {
        // Check if the image source is a fully qualified link (suggesting it is external to the Isaac site),
        // or else an asset link served by the APP, not the API.
        if ((path.indexOf("http") > -1) || (path.indexOf("/assets/") > -1)) {
            return path;
        } else {
            return `${IMAGE_PATH}/${path}`;
        }
    }
};

export const api = {
    notifications: {
        get: (): AxiosPromise => {
            return endpoint.get(`/notifications`)
        },
        respond: (id: string, response: string): AxiosPromise => {
            return endpoint.post(`/notifications/${id}/${response}`)
        }
    },
    questions: {
        answer: (id: string, answer: Immutable<ApiTypes.ChoiceDTO>): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/questions/${id}/answer`, answer);
        },
        testFreeTextQuestion: (userDefinedChoices: Choice[], testCases: TestCaseDTO[]) => {
            return endpoint.post("/questions/test?type=isaacFreeTextQuestion", {userDefinedChoices, testCases});
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
