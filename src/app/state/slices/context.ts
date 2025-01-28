import { createSlice } from "@reduxjs/toolkit";
import { PageContextState } from "../../../IsaacAppTypes";
import { Stage } from "../../../IsaacApiTypes";

interface actionType {
    payload: PageContextState;
    type: string;
}

export const pageContextSlice = createSlice({
    name: 'pageContextSlice',
    initialState: null as PageContextState,
    reducers: {
        updatePageContext: (state, action: actionType) => {
            if (state) {
                state.stage = action.payload?.stage || "all" as Stage;
                state.subject = action.payload?.subject || undefined;
            }
        }
    },
});
