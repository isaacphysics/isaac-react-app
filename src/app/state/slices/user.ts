import {Immutable} from "immer";
import {PotentialUser} from "../../../IsaacAppTypes";
import {createSlice, isAnyOf} from "@reduxjs/toolkit";
import {emailApi, authApi, invalidateUserObjectMatcher, newUserObjectMatcher} from "../index";

type UserState = Immutable<PotentialUser> | null;
export const userSlice = createSlice({
    name: "user",
    initialState: null as UserState,
    reducers: {},
    extraReducers: builder => {
        builder.addMatcher(
            isAnyOf(
                authApi.endpoints.checkProviderCallback.matchPending,
                authApi.endpoints.login.matchPending,
                authApi.endpoints.mfaCompleteLogin.matchPending,
            ),
            () => ({loggedIn: false, requesting: true}),
        ).addMatcher(
            newUserObjectMatcher,
            (_, action) => ({loggedIn: true, ...action.payload})
        ).addMatcher(
            invalidateUserObjectMatcher,
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
