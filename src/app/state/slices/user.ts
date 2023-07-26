import {Immutable} from "immer";
import {PotentialUser} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";
import {createSlice, isAnyOf} from "@reduxjs/toolkit";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {emailApi} from "./api/emailApi";
import {authApi} from "./api/authApi";

type UserState = Immutable<PotentialUser> | null;
export const userSlice = createSlice({
    name: "user",
    initialState: null as UserState,
    reducers: {},
    extraReducers: builder => {
        const loggedInMatcher = (action: any): action is {type: string, user: RegisteredUserDTO} => [
            ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
            ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS,
        ].includes(action.type);

        const loggedOutMatcher = (action: any): action is {type: string} => [
            ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE,
            ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS,
            ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS,
        ].includes(action.type);

        builder.addMatcher(
            isAnyOf(
                authApi.endpoints.checkProviderCallback.matchPending,
                authApi.endpoints.login.matchPending,
                authApi.endpoints.mfaCompleteLogin.matchPending,
            ),
            () => ({loggedIn: false, requesting: true}),
        ).addMatcher(
            isAnyOf(
                authApi.endpoints.checkProviderCallback.matchFulfilled,
                authApi.endpoints.login.matchFulfilled,
                authApi.endpoints.mfaCompleteLogin.matchFulfilled,
            ),
            (_, action) => {
                if ("2FA_REQUIRED" in action.payload) {
                    return {loggedIn: false};
                } else {
                    return {loggedIn: true, ...action.payload};
                }
            },
        ).addMatcher(
            loggedInMatcher,
            (_, action) => ({loggedIn: true, ...action.user}),
        ).addMatcher(
            isAnyOf(
                authApi.endpoints.checkProviderCallback.matchRejected,
                authApi.endpoints.login.matchRejected,
                authApi.endpoints.mfaCompleteLogin.matchRejected,
            ),
            () => ({loggedIn: false}),
        ).addMatcher(
            loggedOutMatcher,
            () => ({loggedIn: false}),
        ).addMatcher(
            emailApi.endpoints.verifyEmail.matchFulfilled,
            (state, action) => {
                if (state?.loggedIn && Number(action.meta.arg.originalArgs.userid) === state.id) {
                    return {...state, emailVerificationStatus: "VERIFIED"};
                }
                return state;
            },
        );
    }
});
