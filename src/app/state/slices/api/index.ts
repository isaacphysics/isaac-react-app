import {FetchBaseQueryArgs} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {BaseQueryFn, FetchArgs, FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {ACTION_TYPE, API_PATH} from "../../../services/constants";
import {
    GlossaryTermDTO,
    ResultsWrapper
} from "../../../../IsaacApiTypes";
import {PrefetchOptions} from "@reduxjs/toolkit/dist/query/core/module";
import {useDispatch} from "react-redux";
import {useEffect} from "react";

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
    tagTypes: ["GlossaryTerms"], // Used to control refetching and caching of collections of data
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

        // Constants

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
        })
    })
});