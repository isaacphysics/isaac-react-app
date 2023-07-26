import {userApi} from "./userApi";
import {AuthenticationProvider, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {isaacBaseQuery, onQueryLifecycleEvents} from "./utils";
import {FIRST_LOGIN_STATE, KEY, persistence, securePadCredentials, trackEvent} from "../../../services";
import ReactGA4 from "react-ga4";
import {CredentialsAuthDTO} from "../../../../IsaacAppTypes";

export const authApi = userApi.enhanceEndpoints({
    addTagTypes: ["UserAuthSettings"],
}).injectEndpoints({
    endpoints: (build) => ({
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
            invalidatesTags: ["UserAuthSettings", "UserPreferences"],
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
                ? ["UserAuthSettings", "UserPreferences"]
                : [],
        }),

        mfaCompleteLogin: build.mutation<RegisteredUserDTO, {mfaVerificationCode: string; rememberMe: boolean}>({
            query: ({mfaVerificationCode, rememberMe}) => ({
                url: `/auth/mfa/challenge`,
                method: "POST",
                body: {mfaVerificationCode, rememberMe}
            }),
            invalidatesTags: ["UserAuthSettings", "UserPreferences"],
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
        //         getCurrentUserAuthSettings: (): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
        //             return endpoint.get(`/auth/user_authentication_settings`)
        //         },
        //         getSelectedUserAuthSettings: (userId: number): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
        //             return endpoint.get(`/auth/user_authentication_settings/${userId}`)
        //         },
        //         linkAccount: (provider: AuthenticationProvider): AxiosPromise => {
        //             return endpoint.get(`/auth/${provider}/link`)
        //         },
        //         unlinkAccount: (provider: AuthenticationProvider): AxiosPromise => {
        //             return endpoint.delete(`/auth/${provider}/link`);
        //         },

    })
});

export const {
    useLazyGetProviderRedirectQuery,
    useCheckProviderCallbackMutation,
    useLoginMutation,
    useMfaCompleteLoginMutation,
} = authApi;
