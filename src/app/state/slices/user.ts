import {createSlice} from "@reduxjs/toolkit";
import {api, UserState} from "./api";


// Just proof of concept for listening to actions from api endpoints
export const userSlice = createSlice({
    name: "newUser",
    initialState: null as UserState,
    reducers: {},
    extraReducers: (builder) => [
        builder.addMatcher(
            api.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                state = payload;
            }),
        builder.addMatcher(
            api.endpoints.logout.matchFulfilled,
            (state, { payload }) => {
                state = { loggedIn: false };
            })
    ]
})