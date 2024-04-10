import {GameboardItem, IsaacConceptPageDTO, IsaacPodDTO} from "../../../../IsaacApiTypes";
import {FEATURED_NEWS_TAG} from "../../../services";
import {onQueryLifecycleEvents} from "./utils";
import {isaacApi} from "./baseApi";

const contentApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({

        getNewsPodList: build.query<IsaacPodDTO[], {subject: string; startIndex?: number}>({
            query: ({subject, startIndex}) => ({
                url: `/pages/pods/${subject}/${startIndex ?? 0}`
            }),
            transformResponse: (response: {results: IsaacPodDTO[]; totalResults: number}, meta, arg) => {
                // Sort news pods to place those tagged "featured" first.
                // The pods are otherwise correctly sorted by ID descending (i.e. newest first) in the backend
                return response.results.sort((a, b) => {
                    const aIsFeatured = a.tags?.includes(FEATURED_NEWS_TAG);
                    const bIsFeatured = b.tags?.includes(FEATURED_NEWS_TAG);
                    if (aIsFeatured && !bIsFeatured) return -1;
                    if (!aIsFeatured && bIsFeatured) return 1;
                    return 0;
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

        getFasttrackConceptQuestions: build.query<GameboardItem[], {gameboardId: string; concept: string; upperQuestionId: string}>({
            query: ({gameboardId, concept, upperQuestionId}) => ({
                url: `/fasttrack/${gameboardId}/concepts`,
                params: {concept, "upper_question_id": upperQuestionId}
            })
        }),
    })
});

export const {useGetNewsPodListQuery, useGetPageFragmentQuery, useGetFasttrackConceptQuestionsQuery} = contentApi;
