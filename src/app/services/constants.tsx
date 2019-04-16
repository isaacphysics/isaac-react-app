import Remarkable from "remarkable";
import {AllTopicsDTO} from "../../IsaacAppTypes";

export const API_VERSION: string = process.env.REACT_APP_API_VERSION || "any";

/*
 * Configure the api provider with the server running the API:
 * No need if we want to use the same server as the static content.
 */
let apiPath: string = `${document.location.origin}/api/${API_VERSION}/api`;
if (document.location.hostname === "localhost") {
    apiPath = "http://localhost:8080/isaac-api/api";
}
export const API_PATH: string = apiPath;
export const MARKDOWN_RENDERER: Remarkable = new Remarkable();

export enum ACTION_TYPES {
    TEST_ACTION = "TEST_ACTION",

    USER_UPDATE_REQUEST = "USER_UPDATE_REQUEST",
    USER_UPDATE_FAILURE = "USER_UPDATE_FAILURE",
    USER_LOG_IN_REQUEST = "USER_LOG_IN_REQUEST",
    USER_LOG_IN_RESPONSE_SUCCESS = "USER_LOG_IN_RESPONSE_SUCCESS",
    USER_LOG_OUT_REQUEST = "USER_LOG_OUT_REQUEST",
    USER_LOG_OUT_RESPONSE_SUCCESS = "USER_LOG_OUT_RESPONSE_SUCCESS",
    AUTHENTICATION_REQUEST_REDIRECT = "AUTHENTICATION_REQUEST_REDIRECT",
    AUTHENTICATION_REDIRECT = "AUTHENTICATION_REDIRECT",
    AUTHENTICATION_HANDLE_CALLBACK = "AUTHENTICATION_HANDLE_CALLBACK",

    DOCUMENT_REQUEST = "DOCUMENT_REQUEST",
    DOCUMENT_RESPONSE_SUCCESS = "DOCUMENT_RESPONSE_SUCCESS",
    DOCUMENT_RESPONSE_FAILURE = "DOCUMENT_RESPONSE_FAILURE",

    QUESTION_REGISTRATION = "QUESTION_REGISTRATION",
    QUESTION_DEREGISTRATION = "QUESTION_DEREGISTRATION",
    QUESTION_ATTEMPT_REQUEST = "QUESTION_ATTEMPT_REQUEST",
    QUESTION_ATTEMPT_RESPONSE_SUCCESS = "QUESTION_ATTEMPT_RESPONSE_SUCCESS",
    QUESTION_ATTEMPT_RESPONSE_FAILURE = "QUESTION_ATTEMPT_RESPONSE_FAILURE",
    QUESTION_SET_CURRENT_ATTEMPT = "QUESTION_SET_CURRENT_ATTEMPT",

    GAMEBOARD_REQUEST = "GAMEBOARD_REQUEST",
    GAMEBOARD_RESPONSE_SUCCESS = "GAMEBOARD_RESPONSE_SUCCESS",

    ASSIGNMENTS_REQUEST = "ASSIGNMENTS_REQUEST",
    ASSIGNMENTS_RESPONSE_SUCCESS = "ASSIGNMENTS_RESPONSE_SUCCESS",
}

export enum EXAM_BOARDS {
    AQA = "AQA",
    OCR = "OCR"
}

export const ALL_TOPICS: AllTopicsDTO = {
    Theory: {
        "GCSE to A-Level transition": {
            "Boolean logic": {comingSoon: true},
            "Programming concepts": {comingSoon: true},
            "Networking": {comingSoon: true, onlyFor: [EXAM_BOARDS.OCR]},
            "Data Representation": {comingSoon: true},
            "Systems": {comingSoon: true},
        },
        "Data structures and algorithms": {},
        "Computer networks": {},
        "Computer Systems": {},
        "Data and Information": {},
    },
    Programming: {
        "Functional programming": {
            "Functions": {comingSoon: true},
            "Lists": {comingSoon: true},
            "Higher order functions": {comingSoon: true},
        },
        "Object oriented programming": {},
        "Procedural programming": {
            "Programming concepts": {comingSoon: true},
            "Subroutines": {destination: "/topics/subroutines"},
            "Files": {comingSoon: true, onlyFor: [EXAM_BOARDS.OCR]},
            "Structure & robustness": {comingSoon: true},
            "Data structures (implementation)": {comingSoon: true},
            "Recursion": {comingSoon: true},
            "String manipulation": {comingSoon: true},
            "GUIs": {comingSoon: true},
            "Software engineering principles": {comingSoon: true},
        }
    }
};
