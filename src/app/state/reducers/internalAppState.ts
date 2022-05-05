import {Action, PrintingSettings} from "../../../IsaacAppTypes";
import {ACTION_TYPE, EXAM_BOARD, STAGE} from "../../services/constants";
import {isaacApi} from "../slices/api";
import {isAnyOf} from "@reduxjs/toolkit";

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

export type TransientUserContextState = {examBoard?: EXAM_BOARD, stage?: STAGE, showOtherContent?: boolean} | null;
export const transientUserContext = (transientUserContext: TransientUserContextState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.TRANSIENT_USER_CONTEXT_SET_STAGE:
            return {...transientUserContext, stage: action.stage}
        case ACTION_TYPE.TRANSIENT_USER_CONTEXT_SET_EXAM_BOARD:
            return {...transientUserContext, examBoard: action.examBoard};
        case ACTION_TYPE.TRANSIENT_USER_CONTEXT_SET_SHOW_OTHER_CONTENT:
            return {...transientUserContext, showOtherContent: action.showOtherContent}
        default:
            return transientUserContext;
    }
};

export type ErrorState = {type: "generalError"; generalError: string} | {type: "consistencyError"} | {type: "serverError"} | {type: "goneAwayError"} | null;
export const error = (error: ErrorState = null, action: any): ErrorState => {
    if (isAnyOf(isaacApi.endpoints.login.matchRejected, isaacApi.endpoints.userAuthSettings.matchRejected, isaacApi.endpoints.userPreferences.matchRejected)(action) && action.error.name !== "ConditionError") {
        return {type: "generalError", generalError: action.error.message ?? ""};
    }

    switch (action.type) {
        case ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE:
        case ACTION_TYPE.EMAIL_AUTHENTICATION_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_INCOMING_PASSWORD_RESET_FAILURE:
        case ACTION_TYPE.USER_PASSWORD_RESET_RESPONSE_FAILURE:
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
