import {FetchBaseQueryArgs} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {BaseQueryFn, FetchArgs, FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {ACTION_TYPE, API_PATH} from "../../../services/constants";
import {
    AuthenticationProvider,
    GlossaryTermDTO, RegisteredUserDTO,
    ResultsWrapper, TOTPSharedSecretDTO, UserAuthenticationSettingsDTO
} from "../../../../IsaacApiTypes";
import {securePadCredentials} from "../../../services/credentialPadding";
import * as persistence from "../../../services/localStorage";
import {KEY} from "../../../services/localStorage";
import {totpChallenge} from "../user";
import {history} from "../../../services/history";
import {showErrorToastIfNeeded, showToast} from "../../actions";
import {
    CredentialsAuthDTO,
    PotentialUser,
    UserPreferencesDTO,
    UserProgress,
    UserSnapshot
} from "../../../../IsaacAppTypes";
import {isLoggedIn} from "../../../services/user";
import {checkForWebSocket, closeWebSocket} from "./websockets";

export const is2FARequired = <T extends {}>(data: T | null) => data?.hasOwnProperty("2FA_REQUIRED")
export interface LoginUserArgs {
    provider: AuthenticationProvider;
    credentials: CredentialsAuthDTO;
}

// This should be used by default as the `baseQuery` of our API slice
const isaacBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const baseQueryArgs: FetchBaseQueryArgs = {
        baseUrl: API_PATH,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            headers.set("accept", "application/json, text/plain, */*");
            return headers;
        }
    }
    const result = await fetchBaseQuery(baseQueryArgs)(args, api, extraOptions);
    if (result.error && result.error.status >= 500 && !(result.error.data as {bypassGenericSiteErrorPage?: boolean})?.bypassGenericSiteErrorPage) {
        if (result.error.status === 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            api.dispatch({type: ACTION_TYPE.API_GONE_AWAY});
        } else if (result.error.status === 401) {
            //
        } else {
            api.dispatch({type: ACTION_TYPE.API_SERVER_ERROR});
        }
        // eslint-disable-next-line no-console
        console.warn("Error from API:", result.error);
    } else {
        if (result.meta?.response?.status && result.meta?.response?.status >= 500) {
            // eslint-disable-next-line no-console
            console.warn("Uncaught error from API:", result.meta?.response);
        }
    }
    return result;
}

// The API slice defines reducers and middleware that need adding to \state\reducers\index.ts and \state\store.ts respectively
export const isaacApi = createApi({
    tagTypes: ["GlossaryTerms", "UserInfo", "Notifications", "UserProgress"], // Used to control refetching and caching of collections of data
    reducerPath: "isaacApi",
    baseQuery: isaacBaseQuery,
    endpoints: (build) => ({
        /* The type parameters of `build.query` are, in order:
         *  - The final return type of the query *after transformations* (`GlossaryTermDTO[]` is extracted from the results wrapper in `transformResponse`)
         *  - The input type of the query function (in this case, `void` because `query` takes no arguments)
         */
        getGlossaryTerms: build.query<GlossaryTermDTO[] | undefined, void>({
            query: () => ({
                url: "/glossary/terms",
                // FIXME: Magic number. This needs to go through pagination with
                //  limit and start_index query parameters.
                params: { limit: 10000 },
            }),
            providesTags: ["GlossaryTerms"], // Just says "I provide data related to this tag". If a mutation
                                             // invalidates "GlossaryTerms", this query would be automatically re-run
            // This lets you modify the response object before it's injected into the `data` field of the final
            // resulting state
            transformResponse: (response: ResultsWrapper<GlossaryTermDTO>) => response.results
        }),

        getGlossaryTermById: build.query<GlossaryTermDTO | undefined, string>({
            query: (id: string) => ({
                url: `/glossary/terms/${id}`
            }),
            providesTags: ["GlossaryTerms"],
        }),

        // Super important vvv
        // https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#performing-multiple-requests-with-a-single-query !!!

        // could use endpoint extensions to separate into different files

        // --- CONSTANTS ---

        getUnits: build.query<string[], void>({
            query: () => ({
                url: "/content/units",
                method: "GET"
            })
        }),
        getSegueVersion: build.query<string, void>({
            query: () => ({
                url: "/info/segue_version",
                method: "GET"
            }),
            transformResponse: (response: {segueVersion: string}) => response.segueVersion
        }),
        getSegueEnvironment: build.query<string, void>({
            query: () => ({
                url: "/info/segue_environment",
                method: "GET"
            }),
            transformResponse: (response: {segueEnvironment: string}) => response.segueEnvironment
        }),

        // Content versions

        getLiveContentVersion: build.query<string, void>({
            query: () => ({
                url: "/info/content_versions/live_version",
                method: "GET"
            }),
            transformResponse: (response: {liveVersion: string}) => response.liveVersion
        }),

        setLiveContentVersion: build.mutation<void, string>({
            query: (version: string) => ({
                url: `/admin/live_version/${version}`,
                method: "POST"
            }),
            onQueryStarted: async (version: string, { dispatch, queryFulfilled }) => {
                // An example of a pessimistic update: https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#pessimistic-updates
                // This is a way of updating the cache of another endpoint
                try {
                    await queryFulfilled;
                    dispatch(isaacApi.util.updateQueryData("getLiveContentVersion", undefined, () => version));
                } catch {}
            }
        }),

        // --- NOTIFICATIONS ---

        getNotifications: build.query<any[], void>({
            query: () => ({
                url: "/notifications",
                method: "GET"
            }),
            providesTags: ["Notifications"]
        }),

        respondToNotification: build.mutation<void, {id: string, response: string}>({
            query: ({id, response}) => ({
                url: `/notifications/${id}/${response}`,
                method: "POST"
            }),
            invalidatesTags: ["Notifications"]
        }),

        // Info for how to implement queries with WebSockets: https://redux-toolkit.js.org/rtk-query/usage/streaming-updates#streaming-update-examples
        myProgress: build.query<UserProgress | null, PotentialUser | null>({
            query: () => ({
                url: "/users/current_user/progress",
                method: "GET"
            }),
            // Only one cache entry can be added for this endpoint, so all subscribed components will use the same websocket
            onCacheEntryAdded: async (user, { cacheDataLoaded, cacheEntryRemoved, dispatch, updateCachedData }) => {
                try {
                    // Wait for the initial query for my progress to finish before proceeding
                    await cacheDataLoaded

                    // If the user is logged in, initiate the websocket connection
                    if (isLoggedIn(user)) checkForWebSocket(user, updateCachedData);

                } catch {}

                await cacheEntryRemoved;

                // WebSocket is always closed on cache entry removal (no components are subscribed to the data anymore)
                closeWebSocket();
            },
            providesTags: [{type: "UserProgress", id: "current_user"}]
        }),

        // Used to poll the snapshot endpoint - only stores the latest snapshot data received from a poll, not from a websocket message
        snapshot: build.query<UserSnapshot | null, void>({
            query: () => ({
                url: "/users/current_user/snapshot",
                method: "GET"
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const snapshot = await queryFulfilled as UserSnapshot;
                    dispatch(isaacApi.util.updateQueryData("myProgress", null, (progress) => {
                        if (progress) progress.userSnapshot = snapshot;
                    }));
                } catch {}
            }
        }),

        userProgress: build.query<UserProgress | null, string>({
            query: (userIdOfInterest: string) => ({
                url: `/users/${userIdOfInterest}/progress`,
                method: "GET"
            }),
            providesTags: (result, error, userIdOfInterest) => result ? [{type: "UserProgress", id: userIdOfInterest}] : []
        }),

        // --- AUTHENTICATION ---

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
});