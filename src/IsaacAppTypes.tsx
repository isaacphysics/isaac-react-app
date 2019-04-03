import {
    AssignmentDTO,
    ChoiceDTO,
    ContentDTO,
    GameboardDTO,
    QuestionDTO,
    QuestionValidationResponseDTO,
    RegisteredUserDTO,
} from "./IsaacApiTypes";

export enum ActionType {
    USER_UPDATE_REQUEST = "USER_UPDATE_REQUEST",
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

export type Action =
    | {type: ActionType.USER_LOG_IN_REQUEST}
    | {type: ActionType.USER_UPDATE_REQUEST}
    | {type: ActionType.USER_LOG_IN_RESPONSE_SUCCESS, user: RegisteredUserDTO}
    | {type: ActionType.USER_LOG_OUT_REQUEST}
    | {type: ActionType.USER_LOG_OUT_RESPONSE_SUCCESS}
    | {type: ActionType.AUTHENTICATION_REQUEST_REDIRECT, provider: string}
    | {type: ActionType.AUTHENTICATION_REDIRECT, provider: string, redirectUrl: string}
    | {type: ActionType.AUTHENTICATION_HANDLE_CALLBACK}

    | {type: ActionType.DOCUMENT_REQUEST, questionId: string}
    | {type: ActionType.DOCUMENT_RESPONSE_SUCCESS, doc: ContentDTO}
    | {type: ActionType.DOCUMENT_RESPONSE_FAILURE}

    | {type: ActionType.QUESTION_REGISTRATION, question: QuestionDTO}
    | {type: ActionType.QUESTION_DEREGISTRATION, questionId: string}
    | {type: ActionType.QUESTION_ATTEMPT_REQUEST, questionId: string, attempt: ChoiceDTO}
    | {type: ActionType.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId: string, response: QuestionValidationResponseDTO}
    | {type: ActionType.QUESTION_ATTEMPT_RESPONSE_FAILURE}
    | {type: ActionType.QUESTION_SET_CURRENT_ATTEMPT, questionId: string, attempt: ChoiceDTO}

    | {type: ActionType.GAMEBOARD_REQUEST, gameboardId: string | null}
    | {type: ActionType.GAMEBOARD_RESPONSE_SUCCESS, gameboard: GameboardDTO}

    | {type: ActionType.ASSIGNMENTS_REQUEST}
    | {type: ActionType.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: AssignmentDTO[]};

export interface AppQuestionDTO extends QuestionDTO {
    validationResponse?: QuestionValidationResponseDTO,
    currentAttempt?: ChoiceDTO,
    canSubmit?: boolean
}
