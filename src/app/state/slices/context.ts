import { createSlice } from "@reduxjs/toolkit";
import { PageContextState } from "../../../IsaacAppTypes";

interface actionType {
    payload: PageContextState;
    type: string;
}

export const pageContextSlice = createSlice({
    name: 'pageContextSlice',
    initialState: null as PageContextState,
    reducers: {
        updatePageContext: (state, action: actionType) => ({
            ...state,
            // stage and subject can be undefined, so should not ??-inherit from the previous context
            stage: action.payload?.stage,
            subject: action.payload?.subject,
            previousContext: action.payload?.previousContext ?? state?.previousContext,
        }),
        resetPageContext: (state) => ({
            ...state,
            stage: undefined,
            subject: undefined,
        }),
    },
});
