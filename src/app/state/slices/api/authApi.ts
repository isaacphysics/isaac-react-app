import {userApi} from "../../index";
import {
    AuthenticationProvider,
    RegisteredUserDTO,
    TOTPSharedSecretDTO,
    UserAuthenticationSettingsDTO
} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {securePadCredentials, trackEvent} from "../../../services";
import ReactGA4 from "react-ga4";
import {CredentialsAuthDTO, ValidationUser} from "../../../../IsaacAppTypes";
import {Immutable} from "immer";
import {isAnyOf, PayloadAction} from "@reduxjs/toolkit";

export const authApi = userApi.enhanceEndpoints({
    addTagTypes: ["CurrentUserAuthSettings"],
}).injectEndpoints({
    endpoints: (build) => ({

        getCurrentUser: build.mutation<RegisteredUserDTO, void>({
            query: () => "/users/current_user",
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
        }),

        // === Authentication settings ===

        getCurrentUserAuthSettings: build.query<UserAuthenticationSettingsDTO, void>({
            query: () => "/auth/user_authentication_settings",
            providesTags: ["CurrentUserAuthSettings"],
        }),

        getSelectedUserAuthSettings: build.query<UserAuthenticationSettingsDTO, number>({
            query: (userId) => `/auth/user_authentication_settings/${userId}`
        }),

        // === Authentication flow ===

        getProviderRedirect: build.query<string, {provider: AuthenticationProvider; isSignup?: boolean}>({
            query: ({provider, isSignup}) => ({
                url: `/auth/${provider}/authenticate`,
                params: {signup: isSignup}
            }),
            transformResponse: (response: {redirectUrl: string}) => response.redirectUrl,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Login redirect failed"
            })
        }),

        checkProviderCallback: build.mutation<RegisteredUserDTO, {provider: AuthenticationProvider; params: string}>({
            query: ({provider, params}) => ({
                url: `/auth/${provider}/callback${params}`
            }),
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Login failed",
                onQuerySuccess: ({provider}, user) => {
                    if (user.firstLogin) {
                        trackEvent("registration", {props: {provider}});
                        ReactGA4.event({
                            category: 'user',
                            action: 'registration',
                            label: `Create Account (${provider})`,
                        });
                    }
                }
            })
        }),

        login: build.mutation<RegisteredUserDTO | {"2FA_REQUIRED": true}, {provider: AuthenticationProvider; credentials: CredentialsAuthDTO}>({
            query: ({provider, credentials}) => ({
                url: `/auth/${provider}/authenticate`,
                method: "POST",
                body: securePadCredentials(credentials)
            }),
            invalidatesTags: (result, error) => !error && result && !("2FA_REQUIRED" in result)
                ? ["CurrentUserAuthSettings", "UserPreferences"]
                : [],
        }),

        mfaCompleteLogin: build.mutation<RegisteredUserDTO, {mfaVerificationCode: string; rememberMe: boolean}>({
            query: ({mfaVerificationCode, rememberMe}) => ({
                url: `/auth/mfa/challenge`,
                method: "POST",
                body: {mfaVerificationCode, rememberMe}
            }),
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Error with MFA verification code."
            })
        }),

        register: build.mutation<RegisteredUserDTO, Immutable<ValidationUser>>({
            query: (user) => ({
                url: "/users",
                method: "POST",
                body: {registeredUser: user}
            }),
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (arg, newUser, {dispatch}) => {
                    dispatch(authApi.endpoints.getCurrentUser.initiate());
                    trackEvent("registration", {props: {provider: "SEGUE"}});
                    ReactGA4.event({
                        category: 'user',
                        action: 'registration',
                        label: 'Create Account (SEGUE)',
                    });
                }
            })
        }),

        logout: build.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST"
            }),
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Logout failed"
            })
        }),

        logoutEverywhere: build.mutation<void, void>({
            query: () => ({
                url: "/auth/logout/everywhere",
                method: "POST"
            }),
            invalidatesTags: ["CurrentUserAuthSettings", "UserPreferences"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Logout everywhere failed"
            })
        }),

        //         linkAccount: (provider: AuthenticationProvider): AxiosPromise => {
        //             return endpoint.get(`/auth/${provider}/link`)
        //         },
        //         unlinkAccount: (provider: AuthenticationProvider): AxiosPromise => {
        //             return endpoint.delete(`/auth/${provider}/link`);
        //         },

        // === Account MFA ===

        setupAccountMFA: build.mutation<void, {sharedSecret: string, mfaVerificationCode: string}>({
            query: ({sharedSecret, mfaVerificationCode}) => ({
                url: "/users/current_user/mfa",
                method: "POST",
                body: {sharedSecret, mfaVerificationCode}
            }),
            invalidatesTags: ["CurrentUserAuthSettings"],
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Configured",
                successMessage: "You have enabled 2FA on your account!",
                errorTitle: "Failed to setup 2FA on account.",
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
        })
    })
});

// Custom matcher that matches a login action that was successful and not a 2FA challenge
export const fulfilledLoginWithNo2FAMatcher = (action: any): action is PayloadAction<RegisteredUserDTO, string, {arg: {originalArgs: {provider: AuthenticationProvider, credentials: CredentialsAuthDTO}}, requestId: string, requestStatus: "fulfilled"}> => {
    return authApi.endpoints.login.matchFulfilled(action) && !("2FA_REQUIRED" in action.payload);
};

// Matches any action that results in the user being logged in successfully. The action payload will
// always be the logged-in user object.
export const loggedInMatcher = isAnyOf(
    fulfilledLoginWithNo2FAMatcher,
    authApi.endpoints.mfaCompleteLogin.matchFulfilled,
    authApi.endpoints.register.matchFulfilled,
    authApi.endpoints.checkProviderCallback.matchFulfilled
);

// Matches actions that result in the most up-to-date user object being available.
export const newUserObjectMatcher = isAnyOf(
    authApi.endpoints.getCurrentUser.matchFulfilled,
    loggedInMatcher
);

// Matches everything that should be considered a logout action.
export const loggedOutMatcher = isAnyOf(
    authApi.endpoints.logout.matchFulfilled,
    authApi.endpoints.logoutEverywhere.matchFulfilled
);

// Matches any action that results in the user object being invalidated.
export const invalidateUserObjectMatcher = isAnyOf(
    loggedOutMatcher,
    authApi.endpoints.checkProviderCallback.matchRejected,
    authApi.endpoints.login.matchRejected,
    authApi.endpoints.mfaCompleteLogin.matchRejected,
    authApi.endpoints.register.matchRejected,
    authApi.endpoints.getCurrentUser.matchRejected
);

export const {
    useSetupAccountMFAMutation,
    useDisableAccountMFAMutation,
    useNewMFASecretMutation,
    useLazyGetProviderRedirectQuery,
    useCheckProviderCallbackMutation,
    useLoginMutation,
    useMfaCompleteLoginMutation,
    useGetCurrentUserAuthSettingsQuery,
    useGetSelectedUserAuthSettingsQuery,
    useRegisterMutation,
    useLogoutMutation,
    useLogoutEverywhereMutation,
} = authApi;
