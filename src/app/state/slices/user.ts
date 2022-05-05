import {createAction, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {authApi, is2FARequired, UserState} from "./api/auth";
import {RegisteredUserDTO, TOTPSharedSecretDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE} from "../../services/constants";

export const authProviderResponse = createAction<RegisteredUserDTO>("authProviderResponse");

export const authSlice = createSlice({
    name: "auth",
    initialState: null as UserState,
    reducers: {},
    extraReducers: (builder) => [
        builder.addCase(
            ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS,
            (state, action) => {
                // @ts-ignore
                return { loggedIn: true, ...action.user };
            }
        ),
        builder.addMatcher(
            authApi.endpoints.login.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                if (is2FARequired(payload)) {
                    return { loggedIn: false };
                }
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            isAnyOf(
                authApi.endpoints.totpChallenge.matchFulfilled,
                authApi.endpoints.currentUser.matchFulfilled,
                authProviderResponse.match
            ),
            (state, { payload }) => {
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            authApi.endpoints.totpChallenge.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            isAnyOf(
                authApi.endpoints.login.matchRejected,
                authApi.endpoints.totpChallenge.matchRejected,
                authApi.endpoints.currentUser.matchRejected,
                authApi.endpoints.logout.matchFulfilled,
                authApi.endpoints.logoutEverywhere.matchFulfilled
            ),
            () => ({ loggedIn: false })
        )
    ]
});

export const totpSharedSecretSlice = createSlice({
    name: "totpSharedSecret",
    initialState: null as TOTPSharedSecretDTO | null,
    reducers: {},
    extraReducers: (builder) => [
        builder.addMatcher(
            authApi.endpoints.newMFASecret.matchFulfilled,
            (state, { payload }) => payload
        ).addMatcher(
            authApi.endpoints.setupAccountMFA.matchFulfilled,
            () => null
        )
    ]
});

type TotpChallengePendingState = boolean;
export const totpChallenge = createSlice({
    name: "totpChallengePending",
    initialState: false as TotpChallengePendingState,
    reducers: {
        challengeRequired: () => true,
        challengeSuccess: () => false
    }
});