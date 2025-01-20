import { createSlice } from "@reduxjs/toolkit";
import { PageContextState, Subject } from "../../../IsaacAppTypes";
import { Stage } from "../../../IsaacApiTypes";

interface actionType {
    payload: PageContextState;
    type: string;
}

export const pageContextSlice = createSlice({
    name: 'pageContextSlice',
    initialState: ({stage: "all" as Stage, subject: undefined as Subject | undefined}),
    reducers: {
        updatePageContext: (state, action: actionType) => {
            if (state) {
                state.stage = action.payload.stage;
                state.subject = action.payload.subject;
            }
        }
    },
});
