import { ContentSummaryDTO, ResultsWrapper } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

const searchApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        searchRequest: build.query<ResultsWrapper<ContentSummaryDTO> | null, {query: string, types?: string}>({
            query: ({query, types}) => ({
                url: `/search`,
                params: {query, types},
            }),

            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to perform search",
            }),
        })
    })
});

export const {
    useSearchRequestQuery,
} = searchApi;
