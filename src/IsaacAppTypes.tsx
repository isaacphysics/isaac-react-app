import * as ApiTypes from "./IsaacApiTypes";
import {ACTION_TYPE, DOCUMENT_TYPE, TAG_ID} from "./app/services/constants";

export type Action =
    | {type: ACTION_TYPE.TEST_ACTION}

    | {type: ACTION_TYPE.ROUTER_PAGE_CHANGE; path: string}

    | {type: ACTION_TYPE.API_SERVER_ERROR}
    | {type: ACTION_TYPE.API_GONE_AWAY}

    | {type: ACTION_TYPE.USER_UPDATE_REQUEST}
    | {type: ACTION_TYPE.USER_UPDATE_FAILURE}

    | {type: ACTION_TYPE.USER_LOG_IN_REQUEST; provider: ApiTypes.AuthenticationProvider}
    | {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS; user: ApiTypes.RegisteredUserDTO}
    | {type: ACTION_TYPE.USER_LOG_IN_FAILURE; errorMessage: string}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST}
    | {type: ACTION_TYPE.USER_PASSWORD_RESET_REQUEST_SUCCESS}
    | {type: ACTION_TYPE.USER_LOG_OUT_REQUEST}
    | {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS}
    | {type: ACTION_TYPE.AUTHENTICATION_REQUEST_REDIRECT; provider: string}
    | {type: ACTION_TYPE.AUTHENTICATION_REDIRECT; provider: string; redirectUrl: string}
    | {type: ACTION_TYPE.AUTHENTICATION_HANDLE_CALLBACK}

    | {type: ACTION_TYPE.CONSTANTS_UNITS_REQUEST}
    | {type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS; units: string[]}

    | {type: ACTION_TYPE.DOCUMENT_REQUEST; documentType: DOCUMENT_TYPE; documentId: string}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_SUCCESS; doc: ApiTypes.ContentDTO}
    | {type: ACTION_TYPE.DOCUMENT_RESPONSE_FAILURE}

    | {type: ACTION_TYPE.QUESTION_REGISTRATION; question: ApiTypes.QuestionDTO}
    | {type: ACTION_TYPE.QUESTION_DEREGISTRATION; questionId: string}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_REQUEST; questionId: string; attempt: ApiTypes.ChoiceDTO}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_SUCCESS; questionId: string; response: ApiTypes.QuestionValidationResponseDTO}
    | {type: ACTION_TYPE.QUESTION_ATTEMPT_RESPONSE_FAILURE}
    | {type: ACTION_TYPE.QUESTION_SET_CURRENT_ATTEMPT; questionId: string; attempt: ApiTypes.ChoiceDTO|ValidatedChoice<ApiTypes.ChoiceDTO>}

    | {type: ACTION_TYPE.TOPIC_REQUEST; topicName: TAG_ID}
    | {type: ACTION_TYPE.TOPIC_RESPONSE_SUCCESS; topic: ApiTypes.IsaacTopicSummaryPageDTO}

    | {type: ACTION_TYPE.GAMEBOARD_REQUEST; gameboardId: string | null}
    | {type: ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS; gameboard: ApiTypes.GameboardDTO}

    | {type: ACTION_TYPE.ASSIGNMENTS_REQUEST}
    | {type: ACTION_TYPE.ASSIGNMENTS_RESPONSE_SUCCESS; assignments: ApiTypes.AssignmentDTO[]};

export interface AppQuestionDTO extends ApiTypes.QuestionDTO {
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
}

export interface ValidatedChoice<C extends ApiTypes.ChoiceDTO> {
    frontEndValidation: boolean;
    choice: C;
}

export function isValidatedChoice(choice: ApiTypes.ChoiceDTO|ValidatedChoice<ApiTypes.ChoiceDTO>): choice is ValidatedChoice<ApiTypes.ChoiceDTO> {
    return choice.hasOwnProperty("frontEndValidation");
}
