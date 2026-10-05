import { ContentSummaryDTO, ResultsWrapper } from "../../../../IsaacApiTypes";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

const searchApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        searchRequest: build.query<ResultsWrapper<ContentSummaryDTO> | null, {query: string, types?: string}>({
            query: ({query, types}) => ({
                url: `/search`,
                params: {query, types},
            }),

            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:search.errorTitle"),
            }),
        })
    })
});

export const {
    useSearchRequestQuery,
} = searchApi;
