import {Immutable} from "immer";
import {PotentialUser} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";
import {createSlice} from "@reduxjs/toolkit";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {emailApi} from "./api/emailApi";

type UserState = Immutable<PotentialUser> | null;
export const userSlice = createSlice({
    name: "user",
    initialState: null as UserState,
    reducers: {},
    extraReducers: builder => {
        const loggingInMatcher = (action: any): action is {type: string} => action.type === ACTION_TYPE.USER_LOG_IN_REQUEST;

        const currentUserMatcher = (action: any): action is {type: string, user: RegisteredUserDTO} => action.type === ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS;
    
        const loggedInMatcher = (action: any): action is {type: string, authResponse: RegisteredUserDTO} => action.type === ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS;

        const loggedOutMatcher = (action: any): action is {type: string} => [
            ACTION_TYPE.USER_LOG_IN_RESPONSE_FAILURE,
            ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE,
            ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS,
            ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS,
            ACTION_TYPE.USER_DELETION_RESPONSE_SUCCESS,
        ].includes(action.type);

        builder.addMatcher(
            loggingInMatcher,
            () => ({loggedIn: false, requesting: true}),
        ).addMatcher(
            loggedInMatcher,
            (_, action) => ({sessionExpiry: undefined, loggedIn: true, ...action.authResponse}),
        ).addMatcher(
            currentUserMatcher,
            (_, action) => ({sessionExpiry: undefined, loggedIn: true, ...action.user}),
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
