import {isaacApi} from "./baseApi";
import {anonymisationFunctions, anonymiseIfNeededWith, onQueryLifecycleEvents} from "./utils";
import {AnsweredQuestionsByDate, TOTPSharedSecretDTO} from "../../../../IsaacApiTypes";
import {UserProgress, UserSnapshot} from "../../../../IsaacAppTypes";

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
    addTagTypes: ["UserSnapshot"],
}).injectEndpoints({
    endpoints: (build) => ({
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
                errorTitle: "Failed to get user progress",
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
                errorTitle: "Failed to get user snapshot",
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
    useGetSnapshotQuery
} = userApi;
