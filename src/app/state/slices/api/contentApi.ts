import {
    ContentSummaryDTO,
    GameboardItem,
    IsaacConceptPageDTO,
    IsaacPodDTO,
    IsaacQuestionPageDTO, IsaacTopicSummaryPageDTO, ResultsWrapper
} from "../../../../IsaacApiTypes";
import {FEATURED_NEWS_TAG, TAG_ID, tags} from "../../../services";
import {onQueryLifecycleEvents} from "./utils";
import {isaacApi} from "./baseApi";
import {DocumentSubject} from "../../../../IsaacAppTypes";

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

        getConceptPage: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (conceptId) => `/pages/concepts/${conceptId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page)
        }),

        listConcepts: build.query<ContentSummaryDTO[], {conceptIds?: string; tagIds?: string}>({
            query: ({conceptIds, tagIds}) => ({
                url: "/pages/concepts",
                params: {conceptIds, tagIds, limit: 999}
            }),
            transformResponse: (response: ResultsWrapper<ContentSummaryDTO>) => response.results ?? [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading concepts list failed"
            })
        }),

        getQuestionPage: build.query<IsaacQuestionPageDTO & DocumentSubject, string>({
            query: (questionId) => `/pages/questions/${questionId}`,
            transformResponse: (page: IsaacQuestionPageDTO) => tags.augmentDocWithSubject(page)
        }),

        getGenericPage: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (pageId) => `/pages/${pageId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page)
        }),

        getPageFragment: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (fragmentId) => `/pages/fragments/${fragmentId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page),
            keepUnusedDataFor: 60
        }),

        getFasttrackConceptQuestions: build.query<GameboardItem[], {gameboardId: string; concept: string; upperQuestionId: string}>({
            query: ({gameboardId, concept, upperQuestionId}) => ({
                url: `/fasttrack/${gameboardId}/concepts`,
                params: {concept, "upper_question_id": upperQuestionId}
            })
        }),

        getTopicSummary: build.query<IsaacTopicSummaryPageDTO, TAG_ID>({
            query: (topicName) => `/pages/topics/${topicName}`
        })
    })
});

export const {
    useGetNewsPodListQuery,
    useGetPageFragmentQuery,
    useGetConceptPageQuery,
    useListConceptsQuery,
    useGetQuestionPageQuery,
    useGetGenericPageQuery,
    useGetFasttrackConceptQuestionsQuery,
    useGetTopicSummaryQuery
} = contentApi;
