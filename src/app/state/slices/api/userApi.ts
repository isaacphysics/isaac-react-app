import {isaacApi} from "./baseApi";
import {anonymisationFunctions, anonymiseIfNeededWith, onQueryLifecycleEvents} from "./utils";
import {AnsweredQuestionsByDate, TOTPSharedSecretDTO} from "../../../../IsaacApiTypes";
import {UserPreferencesDTO, UserProgress, UserSnapshot} from "../../../../IsaacAppTypes";
import {securePadPasswordReset} from "../../../services";

// Used by the websocket and getProgress endpoint to update the user snapshot
export const updateUserSnapshotAction = (snapshot: UserSnapshot, partial?: boolean) => {
    if (partial) {
        return userApi.util.updateQueryData(
            "getSnapshot",
            undefined,
            (oldSnapshot) => ({...oldSnapshot, ...snapshot})
        );
    }
    return userApi.util.upsertQueryData(
        "getSnapshot",
        undefined,
        snapshot
    );
};

// Used by the websocket and getSnapshot endpoint to update the snapshot stored within the current user progress
export const updateProgressSnapshotAction = (snapshot: UserSnapshot) =>
    userApi.util.updateQueryData(
        "getProgress",
        "current_user",
        (draft) => ({
            ...(draft || {}),
            userSnapshot: {...(draft?.userSnapshot || {}), ...snapshot}
        })
    );


export const userApi = isaacApi.enhanceEndpoints({
    addTagTypes: ["UserSnapshot", "UserPreferences"],
}).injectEndpoints({
    endpoints: (build) => ({
        // === User ===

        getUserPreferences: build.query<UserPreferencesDTO, void>({
            query: () => `/users/user_preferences`,
            providesTags: ["UserPreferences"],
        }),

        // === Password reset ===

        passwordReset: build.mutation<void, string>({
            query: (email) => ({
                url: `/users/resetpassword`,
                method: "POST",
                body: {email}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Password reset email sent",
                successMessage: (email) => `If an account exists with the email address ${email}, we have sent you a password reset email. If you don’t receive an email, you may not have an account with this email address.`,
                errorTitle: "Password reset failed"
            })
        }),

        verifyPasswordReset: build.mutation<void, string>({
            query: (token) => `/users/resetpassword/${token}`,
        }),

        handlePasswordReset: build.mutation<void, {token: string; password: string}>({
            query: ({token, password}) => ({
                url: `/users/resetpassword/${token}`,
                method: "POST",
                body: securePadPasswordReset({password})
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Password reset successful",
                successMessage: "Please log in with your new password",
            })
        }),

        passwordResetById: build.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}/resetpassword`,
                method: "POST"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to send password reset email"
            })
        }),

        // === Progress ===

        getAnsweredQuestionsByDate: build.query<AnsweredQuestionsByDate, number>({
            query: (userId) => ({
                url: `/questions/answered_questions/${userId}`,
                params: {
                    "from_date": 0,
                    "to_date": Date.now(),
                    "per_day": false
                }
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get answered question activity data"
            })
        }),

        getProgress: build.query<UserProgress, string>({
            query: (userIdOfInterest = "current_user") => `/users/${userIdOfInterest}/progress`,
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.userProgress),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (arg, progress, {dispatch}) => {
                    if (arg === "current_user" && progress.userSnapshot) {
                        dispatch(updateUserSnapshotAction(progress.userSnapshot));
                    }
                },
            })
        }),

        getSnapshot: build.query<UserSnapshot, void>({
            query: () => `/users/current_user/snapshot`,
            providesTags: ["UserSnapshot"],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (arg, snapshot, {dispatch}) => {
                    dispatch(updateProgressSnapshotAction(snapshot));
                },
            })
        }),

        // === Account MFA ===

        setupAccountMFA: build.mutation<void, {sharedSecret: string, mfaVerificationCode: string}>({
            query: ({sharedSecret, mfaVerificationCode}) => ({
                url: "/users/current_user/mfa",
                method: "POST",
                body: {sharedSecret, mfaVerificationCode}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Configured",
                successMessage: "You have enabled 2FA on your account!",
                errorTitle: "Failed to setup 2FA on account."
            })
        }),

        disableAccountMFA: build.mutation<void, number>({
            query: (userId) => ({
                url: `/users/${userId}/mfa`,
                method: "DELETE"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Disabled",
                successMessage: "You have disabled 2FA on this account!",
                errorTitle: "Failed to disable 2FA on account."
            })
        }),

        newMFASecret: build.mutation<TOTPSharedSecretDTO, void>({
            query: () => ({
                url: "/users/current_user/mfa/new_secret",
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get 2FA secret"
            })
        }),
    })
});

export const {
    useSetupAccountMFAMutation,
    useDisableAccountMFAMutation,
    useNewMFASecretMutation,
    useGetAnsweredQuestionsByDateQuery,
    useGetProgressQuery,
    useGetSnapshotQuery,
    useGetUserPreferencesQuery,
    usePasswordResetMutation,
    useVerifyPasswordResetMutation,
    useHandlePasswordResetMutation,
    usePasswordResetByIdMutation,
} = userApi;
