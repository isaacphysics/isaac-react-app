import {PrintingSettings} from "../../../IsaacAppTypes";
import {ACTION_TYPE, EXAM_BOARD, STAGE} from "../../services";
import {createSlice, isAnyOf, PayloadAction} from "@reduxjs/toolkit";
import {routerPageChange, userApi} from "../index";

export type PrintingSettingsState = PrintingSettings | null;
export const printingSettingsSlice = createSlice({
    name: "printingSettings",
    initialState: null as PrintingSettingsState,
    reducers: {
        enableHints: (state, action: PayloadAction<boolean>) => ({...state, hintsEnabled: action.payload})
    }
})

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
        );
    }
});

export type TransientUserContextState = {examBoard?: EXAM_BOARD, stage?: STAGE, showOtherContent?: boolean} | null;
export const transientUserContextSlice = createSlice({
    name: "transientUserContext",
    initialState: null as TransientUserContextState,
    reducers: {
        setStage: (state, action: PayloadAction<STAGE>) => ({...state, stage: action.payload}),
        setExamBoard: (state, action: PayloadAction<EXAM_BOARD>) => ({...state, examBoard: action.payload}),
        setShowOtherContent: (state, action: PayloadAction<boolean>) => ({...state, showOtherContent: action.payload})
    }
})

export type ErrorState = {type: "generalError"; generalError: string} | {type: "consistencyError"} | {type: "serverError"} | {type: "goneAwayError"} | null;
export const errorSlice = createSlice({
    name: "error",
    initialState: null as ErrorState,
    reducers: {
        apiServerError: (_) => ({type: "serverError"}),
        apiGoneAway: (_) => ({type: "goneAwayError"}),
        clearError: (_) => null
    },
    extraReducers: (builder) => {
        const generalMatcher = (action: any): action is {type: string, errorMessage: string} => [
            ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_FAILURE,
            ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE
        ].includes(action.type);

        builder.addMatcher(
            generalMatcher,
            (_, action) => ({type: "generalError", generalError: action.errorMessage})
        ).addMatcher(
            isAnyOf(
                userApi.endpoints.getUserPreferences.matchRejected
            ),
            (_, {error}) => ({
                type: "generalError",
                generalError: error.message ?? "Unknown error. Please try again later and contact us if the problem persists."
            })
        );
    }
})
