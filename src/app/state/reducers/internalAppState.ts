import {Action, PrintingSettings} from "../../../IsaacAppTypes";
import {ACTION_TYPE, EXAM_BOARD, STAGE} from "../../services/constants";
import {routerPageChange} from "../actions";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

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

export const mainContentIdSlice = createSlice({
    name: "mainContentId",
    initialState: null as string | null,
    reducers: {
        set: (state, action: PayloadAction<string>) => action.payload
    },
    extraReducers: (builder) => {
        builder.addCase(
            routerPageChange,
            () => null,
        )
    }
});

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
export const error = (error: ErrorState = null, action: Action): ErrorState => {
    if (routerPageChange.match(action)) {
        return null;
    }
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
        default:
            return error;
    }
};
