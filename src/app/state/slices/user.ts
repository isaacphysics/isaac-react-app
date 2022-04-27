import {createAction, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {api, is2FARequired, UserState} from "./api";
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
            api.endpoints.login.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            api.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                if (is2FARequired(payload)) {
                    return { loggedIn: false };
                }
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            isAnyOf(api.endpoints.totpChallenge.matchFulfilled, api.endpoints.currentUser.matchFulfilled, authProviderResponse.match),
            (state, { payload }) => {
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            api.endpoints.totpChallenge.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            isAnyOf(api.endpoints.login.matchRejected, api.endpoints.totpChallenge.matchRejected, api.endpoints.currentUser.matchRejected, api.endpoints.logout.matchFulfilled, api.endpoints.logoutEverywhere.matchFulfilled),
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
            api.endpoints.newMFASecret.matchFulfilled,
            (state, { payload }) => payload
        ).addMatcher(
            api.endpoints.setupAccountMFA.matchFulfilled,
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