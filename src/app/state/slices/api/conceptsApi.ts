import { IsaacConceptPageDTO } from "../../../../IsaacApiTypes";
import { Concepts } from "../../../../IsaacAppTypes";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

export const conceptsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        listConcepts: build.query<Concepts, { conceptIds?: string; tagIds?: string }>({
            query: ({ conceptIds, tagIds }) => ({
                url: '/pages/concepts',
                params: { limit: 999, ids: conceptIds, tags: tagIds }
            }),
            
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.concepts.loadError"),
            }),
        }),
        getConcept: build.query<IsaacConceptPageDTO, string>({
            query: (id) => ({
                url: `/pages/concepts/${encodeURIComponent(id)}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.concept.loadError"),
                onQueryStart: (_args, {dispatch}) => {
                    dispatch(docSlice.actions.resetPage());
                },
                onQuerySuccess: (_args, response, {dispatch}) => {
                    dispatch(docSlice.actions.updatePage({ doc: response }));
                }
            }),
        }),
    }),
});

export const {
    useListConceptsQuery,
    useGetConceptQuery,
} = conceptsApi;
