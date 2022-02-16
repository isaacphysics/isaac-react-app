import {FetchBaseQueryArgs} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {BaseQueryFn, FetchArgs, FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {ACTION_TYPE, API_PATH} from "../../services/constants";
import {GlossaryTermDTO, ResultsWrapper} from "../../../IsaacApiTypes";
import {PrefetchOptions} from "@reduxjs/toolkit/dist/query/core/module";
import {useDispatch} from "react-redux";
import {useEffect} from "react";

// This should be used by default as the `baseQuery` of any API slice
const isaacBaseQuery: (fetchBaseQueryArgs?: FetchBaseQueryArgs) => BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (fetchBaseQueryArgs) => async (args, api, extraOptions) => {
    const baseQueryArgs: FetchBaseQueryArgs = {
        baseUrl: API_PATH,
        credentials: "include",
        prepareHeaders: (headers, { getState }) => {
            headers.set("accept", "application/json, text/plain, */*");
            return headers;
        },
        ...fetchBaseQueryArgs // overwrite defaults with any arguments provided
    }
    const result = await fetchBaseQuery(baseQueryArgs)(args, api, extraOptions);
    if (result.error) {
        if (result.error.status === 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            api.dispatch({type: ACTION_TYPE.API_GONE_AWAY});
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

// Each API slice creates reducers and middleware that need adding to \state\reducers\index.ts and \state\store.ts respectively
export const api = createApi({
    tagTypes: ["GlossaryTerms"], // Used to control refetching and caching of collections of data
    reducerPath: 'isaacApi',
    baseQuery: isaacBaseQuery(),
    endpoints: (build) => ({
        /* The type parameters of `build.query` are:
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
                                             // invalidated "GlossaryTerms", this query would be re-run
            // This lets you modify the response object before it's injected into the `data` field of the final
            // resulting state
            transformResponse: (response: ResultsWrapper<GlossaryTermDTO>) => response.results
        }),
        getGlossaryTermById: build.query<GlossaryTermDTO | undefined, string>({
            query: (id: string) => ({
                url: `/glossary/terms/${id}`
            }),
            providesTags: ["GlossaryTerms"],
        })
    })
});


// A recipe provided in the RTK Query API docs for immediately prefetching from a given endpoint
type EndpointNames = keyof typeof api.endpoints

export function usePrefetchImmediately<T extends EndpointNames>(
    endpoint: T,
    arg: Parameters<typeof api.endpoints[T]['initiate']>[0],
    options: PrefetchOptions = {}
) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(api.util.prefetch(endpoint, arg as any, options))
    }, []);
}