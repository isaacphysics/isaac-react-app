import {history} from "../../../services/history";
import {isaacApi} from "./index";
import {
    AuthenticationProvider,
    RegisteredUserDTO,
    TOTPSharedSecretDTO,
    UserAuthenticationSettingsDTO
} from "../../../../IsaacApiTypes";
import {securePadCredentials} from "../../../services/credentialPadding";
import * as persistence from "../../../services/localStorage";
import {KEY} from "../../../services/localStorage";
import {totpChallenge} from "../user";
import {showErrorToastIfNeeded, showToast} from "../../actions";
import {CredentialsAuthDTO, PotentialUser, UserPreferencesDTO} from "../../../../IsaacAppTypes";

export const is2FARequired = <T extends {}>(data: T | null) => data?.hasOwnProperty("2FA_REQUIRED")

export type UserState = PotentialUser | null;
export interface LoginUserArgs {
    provider: AuthenticationProvider;
    credentials: CredentialsAuthDTO;
}

export const authApi = isaacApi.enhanceEndpoints({addTagTypes: ["UserInfo"]}).injectEndpoints({
    endpoints: (build) => ({
        // Login endpoint
        login: build.mutation<RegisteredUserDTO, LoginUserArgs>({
            query: ({provider, credentials}: LoginUserArgs) => ({
                url: `/auth/${provider}/authenticate`,
                method: "POST",
                body: securePadCredentials(credentials)
            }),
            onQueryStarted: async (loginArgs: LoginUserArgs, { dispatch , queryFulfilled }) => {
                const afterAuthPath = persistence.load(KEY.AFTER_AUTH_PATH) || '/';
                try {
                    const { data } = await queryFulfilled;
                    if (is2FARequired(data)) {
                        dispatch(totpChallenge.actions.challengeRequired());
                        return;
                    }
                    persistence.remove(KEY.AFTER_AUTH_PATH);
                    history.push(afterAuthPath);
                } catch (err: any) {}
            }
        }),

        logout: build.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            onQueryStarted: async (_, { dispatch , queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Logout failed", e));
                }
            },
            invalidatesTags: ["UserInfo"]
        }),

        logoutEverywhere: build.mutation<void, void>({
            query: () => ({
                url: "/auth/logout/everywhere",
                method: "POST",
            }),
            onQueryStarted: async (_, { dispatch , queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Logout everywhere failed", e));
                }
            },
            invalidatesTags: ["UserInfo"]
        }),

        // TODO could use a custom queryFn here to make the endpoint store whether there is a totp challenge pending or not
        //  (removing the need for the totpChallenge slice in slices/user.ts).
        totpChallenge: build.mutation<RegisteredUserDTO, {mfaVerificationCode: string, rememberMe: boolean}>({
            query: ({mfaVerificationCode, rememberMe}) => ({
                url: `/auth/mfa/challenge`,
                method: "POST",
                body: {mfaVerificationCode: mfaVerificationCode, rememberMe}
            }),
            onQueryStarted: async (args: {mfaVerificationCode: string, rememberMe: boolean}, { dispatch , queryFulfilled }) => {
                const afterAuthPath = persistence.load(KEY.AFTER_AUTH_PATH) || '/';
                try {
                    await queryFulfilled;
                    dispatch(totpChallenge.actions.challengeSuccess());
                    persistence.remove(KEY.AFTER_AUTH_PATH);
                    history.push(afterAuthPath);
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Error with verification code.", e));
                }
            }
        }),

        setupAccountMFA: build.mutation<void, {sharedSecret: string, mfaVerificationCode: string}>({
            query: ({sharedSecret, mfaVerificationCode}) => ({
                url: "/users/current_user/mfa",
                method: "POST",
                body: {sharedSecret, mfaVerificationCode}
            }),
            onQueryStarted: async (_, { dispatch , queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(showToast({
                        color: "success",
                        title: "2FA Configured",
                        body: "You have enabled 2FA on your account!"
                    }));
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Failed to setup 2FA on account", e));
                }
            }
        }),

        disableAccountMFA: build.mutation<void, number>({
            query: (userId) => ({
                url: `/users/${userId}/mfa`,
                method: "DELETE"
            }),
            onQueryStarted: async (_, { dispatch , queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(showToast({
                        color: "success",
                        title: "2FA Disabled",
                        body: "You have disabled 2FA on this account!"
                    }));
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Failed to disable 2FA on account.", e));
                }
            }
        }),
        newMFASecret: build.mutation<TOTPSharedSecretDTO, void>({
            query: () => ({
                url: "/users/current_user/mfa/new_secret",
                method: "GET"
            }),
            onQueryStarted: async (_, { dispatch , queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Failed to get 2FA secret", e));
                }
            }
        }),

        // TODO using custom queryFn on other endpoints in this slice, alongside the utils.updateCacheEntry api method,
        //  this endpoint could be used as the main source of truth for the user object, instead of needing another slice
        currentUser: build.query<RegisteredUserDTO, void>( {
            query: () => ({
                url: "/users/current_user",
                method: "GET"
            }),
            providesTags: [{type: "UserInfo", id: "User"}]
        }),

        userAuthSettings: build.query<UserAuthenticationSettingsDTO, void>( {
            query: () => ({
                url: "/auth/user_authentication_settings",
                method: "GET"
            }),
            providesTags: [{type: "UserInfo", id: "Auth"}]
        }),

        userPreferences: build.query<UserPreferencesDTO, void>({
            query: () => ({
                url: "/users/user_preferences",
                method: "GET"
            }),
            providesTags: [{type: "UserInfo", id: "Preferences"}]
        }),


        getSelectedUserAuthSettings: build.query<UserAuthenticationSettingsDTO, number>({
            query: (userId: number) => ({
                url: `/auth/user_authentication_settings/${userId}`,
                method: "GET"
            })
        }),

        // TODO not sure if the two below work - I need to test Google auth linking and logging in extensively

        linkAccount: build.mutation<{ redirectUrl: string }, AuthenticationProvider>({
            query: (provider: AuthenticationProvider) => ({
                url: `/auth/${provider}/link`,
                method: "GET",
            }),
            onQueryStarted: async (provider: AuthenticationProvider, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    window.location.href = data.redirectUrl;
                } catch (e: any) {
                    dispatch(showErrorToastIfNeeded("Failed to link account", e));
                }
            }
        }),

        unlinkAccount: build.mutation<void, AuthenticationProvider>({
            query: (provider: AuthenticationProvider) => ({
                url: `/auth/${provider}/link`,
                method: "DELETE",
            }),
            invalidatesTags: ["UserInfo"],
            onQueryStarted: async (provider: AuthenticationProvider, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                    dispatch(showToast({
                        title: "Account unlinked",
                        body: "Your account settings were updated successfully.",
                        color: "success",
                        timeout: 5000,
                        closable: false,
                    }));
                } catch (e) {
                    dispatch(showErrorToastIfNeeded("Failed to unlink account", e));
                }
            },
        })
    })
})