import {createAction, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {RegisteredUserDTO, TOTPSharedSecretDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE} from "../../services/constants";
import {PotentialUser} from "../../../IsaacAppTypes";
import {is2FARequired, isaacApi} from "./api";

export const authProviderResponse = createAction<RegisteredUserDTO>("authProviderResponse");

export type UserState = PotentialUser | null;
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
            isaacApi.endpoints.login.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            isaacApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                if (is2FARequired(payload)) {
                    return { loggedIn: false };
                }
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            isAnyOf(
                isaacApi.endpoints.totpChallenge.matchFulfilled,
                isaacApi.endpoints.currentUser.matchFulfilled,
                authProviderResponse.match
            ),
            (state, { payload }) => {
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            isaacApi.endpoints.totpChallenge.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            isAnyOf(
                isaacApi.endpoints.login.matchRejected,
                isaacApi.endpoints.totpChallenge.matchRejected,
                isaacApi.endpoints.currentUser.matchRejected,
                isaacApi.endpoints.logout.matchFulfilled,
                isaacApi.endpoints.logoutEverywhere.matchFulfilled
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
            isaacApi.endpoints.newMFASecret.matchFulfilled,
            (state, { payload }) => payload
        ).addMatcher(
            isaacApi.endpoints.setupAccountMFA.matchFulfilled,
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