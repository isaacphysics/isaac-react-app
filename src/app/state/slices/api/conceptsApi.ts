import { IsaacConceptPageDTO } from "../../../../IsaacApiTypes";
import { Concepts } from "../../../../IsaacAppTypes";
import { isaacApi } from "./baseApi";

export const conceptsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        listConcepts: build.query<Concepts, { conceptIds?: string; tagIds?: string }>({
            query: ({ conceptIds, tagIds }) => ({
                url: '/pages/concepts',
                params: { limit: 999, ids: conceptIds, tags: tagIds }
            }),
        }),
        getConcept: build.query<IsaacConceptPageDTO, string>({
            query: (id) => ({
                url: `/pages/concepts/${id}`
            })
        }),
    }),
});

export const {
    useListConceptsQuery,
    useGetConceptQuery,
} = conceptsApi;
