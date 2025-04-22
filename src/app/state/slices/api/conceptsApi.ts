import { IsaacConceptPageDTO } from "../../../../IsaacApiTypes";
import { Concepts } from "../../../../IsaacAppTypes";
import { tags } from "../../../services";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export const conceptsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        listConcepts: build.query<Concepts, { conceptIds?: string; tagIds?: string }>({
            query: ({ conceptIds, tagIds }) => ({
                url: '/pages/concepts',
                params: { limit: 999, ids: conceptIds, tags: tagIds }
            }),
            
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load concepts",
            }),
        }),
        getConcept: build.query<IsaacConceptPageDTO, string>({
            query: (id) => ({
                url: `/pages/concepts/${id}`
            }),
            transformResponse: (response: IsaacConceptPageDTO) => {
                return tags.augmentDocWithSubject(response);
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load concept",
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
