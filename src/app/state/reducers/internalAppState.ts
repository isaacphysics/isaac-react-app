import {Action, PrintingSettings} from "../../../IsaacAppTypes";
import {ACTION_TYPE, EXAM_BOARD} from "../../services/constants";

export type PrintingSettingsState = PrintingSettings | null;
export const printingSettings = (printingSettingsState: PrintingSettingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.PRINTING_SET_HINTS: {
            return {...printingSettingsState, hintsEnabled: action.hintsEnabled};
        }
        default: {
            return printingSettingsState;
        }
    }
};

type MainContentIdState = string | null;
export const mainContentId = (state: MainContentIdState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.SET_MAIN_CONTENT_ID:
            return action.id;
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return state;
    }
};

export type TempExamBoardState = EXAM_BOARD | null;
export const tempExamBoard = (tempExamBoard: TempExamBoardState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EXAM_BOARD_SET_TEMP:
            return action.examBoard;
        default:
            return tempExamBoard;
    }
};

export type ErrorState = {type: "generalError"; generalError: string} | {type: "consistencyError"} | {type: "serverError"} | {type: "goneAwayError"} | null;
export const error = (error: ErrorState = null, action: Action): ErrorState => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE:
        case ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE:
        case ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE:
            return {type: "generalError", generalError: action.errorMessage};
        case ACTION_TYPE.USER_CONSISTENCY_ERROR:
            return {type: "consistencyError"};
        case ACTION_TYPE.API_SERVER_ERROR:
            return {type: "serverError"};
        case ACTION_TYPE.API_GONE_AWAY:
            return {type: "goneAwayError"};
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return error;
    }
};
