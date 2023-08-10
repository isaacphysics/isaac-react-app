import {isaacApi} from "./baseApi";
import {onQueryLifecycleEvents} from "./utils";
import {TOTPSharedSecretDTO} from "../../../../IsaacApiTypes";

export const userApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
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

        upgradeToTeacherAccount: build.mutation({
            query: () => ({
                url: "/users/current_user/upgrade_to_teacher",
                method: "POST"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Account upgraded",
                successMessage: "You have upgraded to a teacher account!",
                errorTitle: "Failed to upgrade account"
            })
        })
    })
});

export const {useSetupAccountMFAMutation, useDisableAccountMFAMutation, useNewMFASecretMutation, useUpgradeToTeacherAccountMutation} = userApi;