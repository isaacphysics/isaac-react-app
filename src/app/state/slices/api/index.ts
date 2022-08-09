import {ACTION_TYPE, API_PATH, FEATURED_NEWS_TAG} from "../../../services/constants";
import {BaseQueryFn} from "@reduxjs/toolkit/query";
import {
    FetchArgs,
    FetchBaseQueryArgs,
    FetchBaseQueryError
} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {IsaacConceptPageDTO, IsaacPodDTO, TOTPSharedSecretDTO} from "../../../../IsaacApiTypes";
import {showAxiosErrorToastIfNeeded, showSuccessToast} from "../../actions";
import {Dispatch} from "redux";

// This is used by default as the `baseQuery` of our API slice
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

interface QueryToastSpec {
    successTitle?: string;
    successMessage?: string;
    errorMessage?: string;
}

const displayToastsOnQueryLifecycleEvents = ({successTitle, successMessage, errorMessage}: QueryToastSpec) => async (arg: any, { dispatch, queryFulfilled }: { dispatch: Dispatch<any>, queryFulfilled: Promise<{data: any, meta: {} | undefined}>}) => {
    try {
        await queryFulfilled;
        if (successTitle && successMessage) {
            dispatch(showSuccessToast(successTitle, successMessage));
        }
    } catch (e) {
        if (errorMessage) {
            dispatch(showAxiosErrorToastIfNeeded(errorMessage, e));
        }
    }
};

// The API slice defines reducers and middleware that need adding to \state\reducers\index.ts and \state\store.ts respectively
const isaacApi = createApi({
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
           onQueryStarted: displayToastsOnQueryLifecycleEvents({
               successTitle: "2FA Configured",
               successMessage: "You have enabled 2FA on your account!",
               errorMessage: "Failed to setup 2FA on account."
           })
       }),

       disableAccountMFA: build.mutation<void, number>({
           query: (userId) => ({
               url: `/users/${userId}/mfa`,
               method: "DELETE"
           }),
           onQueryStarted: displayToastsOnQueryLifecycleEvents({
               successTitle: "2FA Disabled",
               successMessage: "You have disabled 2FA on this account!",
               errorMessage: "Failed to disable 2FA on account."
           })
       }),

       newMFASecret: build.mutation<TOTPSharedSecretDTO, void>({
           query: () => ({
               url: "/users/current_user/mfa/new_secret",
               method: "GET"
           }),
           onQueryStarted: displayToastsOnQueryLifecycleEvents({
               errorMessage: "Failed to get 2FA secret"
           })
       }),

       getNewsPodList: build.query<IsaacPodDTO[], {subject: string; orderDecending?: boolean}>({
           query: ({subject}) => ({
               url: `/pages/pods/${subject}`
           }),
           transformResponse: (response: {results: IsaacPodDTO[]; totalResults: number}, meta, arg) => {
               // Sort news pods in order of id (asc or desc depending on orderDecending), with ones tagged "featured"
               // placed first
               return response.results.sort((a, b) => {
                   const aIsFeatured = a.tags?.includes(FEATURED_NEWS_TAG);
                   const bIsFeatured = b.tags?.includes(FEATURED_NEWS_TAG);
                   if (aIsFeatured && !bIsFeatured) return -1;
                   if (!aIsFeatured && bIsFeatured) return 1;
                   return a.id && b.id
                       ? a.id.localeCompare(b.id) * (arg.orderDecending ? -1 : 1)
                       : 0;
               });
           },
           onQueryStarted: displayToastsOnQueryLifecycleEvents({
               errorMessage: "Unable to display news"
           })
       }),

       getPageFragment: build.query<IsaacConceptPageDTO, string>({
           query: (fragmentId) => ({
               url: `/pages/fragments/${fragmentId}`
           })
       })
   })
});


export {isaacApi};