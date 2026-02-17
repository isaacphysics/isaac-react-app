import {PrintingSettings} from "../../../IsaacAppTypes";
import {ACTION_TYPE, EXAM_BOARD, siteSpecific, STAGE} from "../../services";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {routerPageChange} from "../index";

export type PrintingSettingsState = PrintingSettings | null;
export const printingSettingsSlice = createSlice({
    name: "printingSettings",
    initialState: null as PrintingSettingsState,
    reducers: {
        enableHints: (state, action: PayloadAction<boolean>) => ({...state, hintsEnabled: action.payload})
    }
});

export type MainContentIdState = {id: string, priority: number};
export const mainContentIdSlice = createSlice({
    name: "mainContentId",
    initialState: null as MainContentIdState | null,
    reducers: {
        set: (state, action: PayloadAction<MainContentIdState>) => (
            // since various components which can exist simultaneously may want to set the main content ID,
            // we use a priority system so that higher priority components consistently win.
            state === null
                ? action.payload
                : action.payload.priority > state.priority ? action.payload : state
        ),
        clear: () => null
    },
    extraReducers: (builder) => {
        builder.addCase(
            routerPageChange,
            () => null,
        );
    }
});

export type SidebarState = {open: boolean} | null;
export const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: {
        open: siteSpecific(false, window.innerWidth >= 768 + 220)
    } as SidebarState,
    reducers: {
        setOpen: (state, action: PayloadAction<boolean>) => ({...state, open: action.payload}),
        toggle: (state) => ({...state, open: !state?.open})
    }
});

export type TransientUserContextState = {examBoard?: EXAM_BOARD, stage?: STAGE, isFixedContext?: boolean} | null;
export const transientUserContextSlice = createSlice({
    name: "transientUserContext",
    initialState: null as TransientUserContextState,
    reducers: {
        setStage: (state, action: PayloadAction<STAGE | undefined>) => ({...state, stage: action.payload}),
        setExamBoard: (state, action: PayloadAction<EXAM_BOARD | undefined>) => ({...state, examBoard: action.payload}),
        setFixedContext: (state, action: PayloadAction<boolean>) => ({...state, isFixedContext: action.payload}),
    }
});

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
            ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE,
            ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_FAILURE,
            ACTION_TYPE.USER_PREFERENCES_RESPONSE_FAILURE
        ].includes(action.type);

        builder.addMatcher(
            generalMatcher,
            (_, action) => ({type: "generalError", generalError: action.errorMessage})
        );
    }
});
