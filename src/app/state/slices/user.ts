import {createAction, createReducer, createSlice} from "@reduxjs/toolkit";
import {api, is2FARequired, UserState} from "./api";
import {TOTPSharedSecretDTO} from "../../../IsaacApiTypes";
import {ACTION_TYPE} from "../../services/constants";

const initialState = {loggedIn: false} as UserState;
export const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => [
        builder.addCase(
            ACTION_TYPE.CLEAR_STATE,
            () => initialState
        ).addCase(
            ACTION_TYPE.USER_UPDATE_RESPONSE_SUCCESS,
            (state, action) => {
                // @ts-ignore
                return { loggedIn: true, ...action.user };
            }
        ).addCase(
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
            api.endpoints.login.matchRejected,
            () => ({ loggedIn: false })
        ).addMatcher(
            api.endpoints.totpChallenge.matchPending,
            () => ({ loggedIn: false, requesting: true })
        ).addMatcher(
            api.endpoints.totpChallenge.matchFulfilled,
            (state, { payload }) => {
                return { loggedIn: true, ...payload };
            }
        ).addMatcher(
            api.endpoints.totpChallenge.matchRejected,
            () => ({ loggedIn: false })
        )
    ]
});

export const TotpSharedSecretSlice = createSlice({
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
const totpChallengePendingInitialState = false as TotpChallengePendingState;

export const totpChallengeRequired = createAction(ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUIRED);
export const totpChallengeSuccess = createAction(ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_SUCCESS);
export const totpChallengePending = createReducer(totpChallengePendingInitialState, (builder) => {
    builder.addCase(
        totpChallengeRequired,
        () => true
    ).addCase(
        totpChallengeSuccess,
        () => false
    )
});