import {createSlice} from "@reduxjs/toolkit";
import {routerPageChange} from "../actions/routing";

export type LinkableSettingState = {target: string, seen: boolean} | null

export const linkableSettingSlice = createSlice(
    {
        name: 'linkableSettingSlice',
        initialState: null as LinkableSettingState,
        reducers: {
            setTarget: (state, action) => {
                if (!state) {
                    return {target: action.payload, seen: false};
                } else {
                    state.target = action.payload;
                    state.seen = false;
                }
            },
            setSeen: (state) => {
                if (state) {
                    state.seen = true;
                }
            }
        },
        extraReducers: (builder) => {
            // If the target setting has been seen, this state is no longer needed - clear it on page change.
            builder.addCase(
                routerPageChange,
                (state) => {if (state?.seen) return null;},
            );
        }
    }
);
