import {PrintingSettings} from "../../../IsaacAppTypes";
import {EXAM_BOARD, STAGE} from "../../services";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {routerPageChange} from "../index";

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

export type ErrorState = {type: "consistencyError"} | {type: "serverError"} | {type: "goneAwayError"} | null;
export const errorSlice = createSlice({
    name: "error",
    initialState: null as ErrorState,
    reducers: {
        apiServerError: (_) => ({type: "serverError"}),
        apiGoneAway: (_) => ({type: "goneAwayError"}),
        clearError: (_) => null
    }
});
