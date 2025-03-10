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
            stage: action.payload?.stage ?? state?.stage,
            subject: action.payload?.subject ?? state?.subject,
            previousContext: action.payload?.previousContext ?? state?.previousContext,
        }),
        resetPageContext: (state) => ({
            ...state,
            stage: undefined,
            subject: undefined,
        }),
    },
});
