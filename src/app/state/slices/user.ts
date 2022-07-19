import {createSlice} from "@reduxjs/toolkit";
import {TOTPSharedSecretDTO} from "../../../IsaacApiTypes";
import {isaacApi} from "./api";

export const totpSharedSecretSlice = createSlice({
    name: "totpSharedSecret",
    initialState: null as TOTPSharedSecretDTO | null,
    reducers: {},
    extraReducers: (builder) => [
        builder.addMatcher(
            isaacApi.endpoints.newMFASecret.matchFulfilled,
            (state, { payload }) => payload
        ).addMatcher(
            isaacApi.endpoints.setupAccountMFA.matchFulfilled,
            () => null
        )
    ]
});