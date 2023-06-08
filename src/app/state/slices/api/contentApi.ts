import {IsaacConceptPageDTO, IsaacPodDTO} from "../../../../IsaacApiTypes";
import {FEATURED_NEWS_TAG} from "../../../services";
import {onQueryLifecycleEvents} from "./utils";
import {isaacApi} from "./baseApi";

const contentApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({

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
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to display news"
            }),
            keepUnusedDataFor: 60
        }),

        getPageFragment: build.query<IsaacConceptPageDTO, string>({
            query: (fragmentId) => ({
                url: `/pages/fragments/${fragmentId}`
            }),
            keepUnusedDataFor: 60
        }),
    })
});

export const {useGetNewsPodListQuery, useGetPageFragmentQuery} = contentApi;
