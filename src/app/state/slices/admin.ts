import {createSlice} from "@reduxjs/toolkit";
import {adminApi} from "./api/adminApi";
import {UserSummaryForAdminUsersDTO} from "../../../IsaacApiTypes";

export const adminUserSearchSlice = createSlice({
    name: 'adminUserSearch',
    initialState: [] as UserSummaryForAdminUsersDTO[],
    reducers: {},
    extraReducers: builder => {
        builder.addMatcher(
            adminApi.endpoints.adminSearchUsers.matchFulfilled,
            (_, action) => action.payload
        ).addMatcher(
            adminApi.endpoints.adminDeleteUser.matchFulfilled,
            (state, action) =>
                state.filter(u => u.id !== action.meta.arg.originalArgs)
        ).addMatcher(
            adminApi.endpoints.adminModifyUserRoles.matchFulfilled,
            (state, action) => {
                for (const u of state) {
                    if (u.id && action.meta.arg.originalArgs.userIds.includes(u.id)) {
                        u.role = action.meta.arg.originalArgs.role;
                    }
                }
            }
        ).addMatcher(
            adminApi.endpoints.adminModifyUserEmailVerificationStatus.matchFulfilled,
            (state, action) => {
                for (const u of state) {
                    if (u.email && action.meta.arg.originalArgs.emails.includes(u.email)) {
                        u.emailVerificationStatus = action.meta.arg.originalArgs.status;
                    }
                }
            }
        )
    }
});
