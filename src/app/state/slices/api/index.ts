// This should be used by default as the `baseQuery` of our API slice
import {ACTION_TYPE, API_PATH} from "../../../services/constants";
import {BaseQueryFn} from "@reduxjs/toolkit/query";
import {
    FetchArgs,
    FetchBaseQueryArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {TOTPSharedSecretDTO} from "../../../../IsaacApiTypes";
import {showErrorToastIfNeeded, showToast} from "../../actions";

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
let isaacApi = createApi({
   tagTypes: ["GlossaryTerms"],
   reducerPath: "isaacApi",
   baseQuery: isaacBaseQuery,
   endpoints: (build) => ({
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
   })
});


export {isaacApi};