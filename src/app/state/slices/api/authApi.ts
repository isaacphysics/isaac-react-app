import {userApi} from "./userApi";
import {
    AuthenticationProvider,
    RegisteredUserDTO,
    TOTPSharedSecretDTO,
    UserAuthenticationSettingsDTO
} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {FIRST_LOGIN_STATE, KEY, persistence, securePadCredentials, trackEvent} from "../../../services";
import ReactGA4 from "react-ga4";
import {CredentialsAuthDTO} from "../../../../IsaacAppTypes";

export const authApi = userApi.enhanceEndpoints({
    addTagTypes: ["CurrentUserAuthSettings"],
}).injectEndpoints({
    endpoints: (build) => ({
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
                        persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
                        trackEvent("registration", {props:
                                {
                                    provider: provider,
                                }
                            }
                        );
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

        //         logout: (): AxiosPromise => {
        //             return endpoint.post(`/auth/logout`);
        //         },
        //         logoutEverywhere: (): AxiosPromise => {
        //             return endpoint.post(`/auth/logout/everywhere`);
        //         },
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

export const {
    useSetupAccountMFAMutation,
    useDisableAccountMFAMutation,
    useNewMFASecretMutation,
    useLazyGetProviderRedirectQuery,
    useCheckProviderCallbackMutation,
    useLoginMutation,
    useMfaCompleteLoginMutation,
    useGetCurrentUserAuthSettingsQuery,
    useGetSelectedUserAuthSettingsQuery
} = authApi;
