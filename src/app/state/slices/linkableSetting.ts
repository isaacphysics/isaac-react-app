import {createSlice} from "@reduxjs/toolkit";
import {routerPageChange} from "../actions/routing";

export type LinkableSettingState = {target: string | undefined, seen: boolean}

export const linkableSettingSlice = createSlice(
    {
        name: 'linkableSettingSlice',
        initialState: {target: undefined, seen: false} as LinkableSettingState,
        reducers: {
            setTarget: (state, action) => {
                state.target = action.payload;
                state.seen = false;
            },
            setSeen: (state) => {
                state.seen = true;
            }
        },
        extraReducers: (builder) => {
            // If the target setting has been seen, this state is no longer needed - clear it on page change.
            builder.addCase(
                routerPageChange,
                (state) => {if (state.seen) state.target = undefined;},
            );
        }
    }
);
