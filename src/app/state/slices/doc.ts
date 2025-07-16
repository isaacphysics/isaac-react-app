import { createSlice } from "@reduxjs/toolkit";
import { ContentDTO } from "../../../IsaacApiTypes";
import { NOT_FOUND_TYPE } from "../../../IsaacAppTypes";

type DocState = {
    doc: ContentDTO | NOT_FOUND_TYPE | null;
} | null;

interface actionType {
    payload: DocState;
    type: string;
}

export const docSlice = createSlice({
    name: 'docSlice',
    initialState: null as DocState,
    reducers: {
        updatePage: (state, action: actionType) => {
            if (state?.doc === null) {
                return {
                    ...state,
                    doc: action.payload?.doc ?? null,
                };
            }
            return state;
        },
        resetPage: (state) => ({
            ...state,
            doc: null,
        }),
    },
});
