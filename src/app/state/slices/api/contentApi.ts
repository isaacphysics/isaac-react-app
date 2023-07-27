import {
    ContentSummaryDTO,
    GameboardItem, GlossaryTermDTO,
    IsaacConceptPageDTO,
    IsaacPodDTO,
    IsaacQuestionPageDTO, IsaacTopicSummaryPageDTO, ResultsWrapper
} from "../../../../IsaacApiTypes";
import {FEATURED_NEWS_TAG, TAG_ID, tags} from "../../../services";
import {onQueryLifecycleEvents} from "./utils";
import {isaacApi} from "./baseApi";
import {DocumentSubject, QuestionSearchQuery} from "../../../../IsaacAppTypes";

export const contentApi = isaacApi.injectEndpoints({
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

        getGlossaryTerms: build.query<GlossaryTermDTO[], void>({
            query: () => ({
                url: "/glossary/terms",
                params: {limit: 10000}
            }),
            transformResponse: (response: ResultsWrapper<GlossaryTermDTO>) => response.results ?? [],
            keepUnusedDataFor: 300 // 5 minutes
        }),

        getGlossaryTermById: build.query<GlossaryTermDTO, string>({
            query: (id) => `/glossary/terms/${id}`,
        }),

        // === Pages ===

        getConceptPage: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (conceptId) => `/pages/concepts/${conceptId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page)
        }),

        getQuestionPage: build.query<IsaacQuestionPageDTO & DocumentSubject, string>({
            query: (questionId) => `/pages/questions/${questionId}`,
            transformResponse: (page: IsaacQuestionPageDTO) => tags.augmentDocWithSubject(page)
        }),

        getGenericPage: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (pageId) => `/pages/${pageId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page)
        }),

        getTopicSummary: build.query<IsaacTopicSummaryPageDTO, TAG_ID>({
            query: (topicName) => `/pages/topics/${topicName}`
        }),

        getPageFragment: build.query<IsaacConceptPageDTO & DocumentSubject, string>({
            query: (fragmentId) => `/pages/fragments/${fragmentId}`,
            transformResponse: (page: IsaacConceptPageDTO) => tags.augmentDocWithSubject(page),
            keepUnusedDataFor: 60
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

        getFasttrackConceptQuestions: build.query<GameboardItem[], {gameboardId: string; concept: string; upperQuestionId: string}>({
            query: ({gameboardId, concept, upperQuestionId}) => ({
                url: `/fasttrack/${gameboardId}/concepts`,
                params: {concept, "upper_question_id": upperQuestionId}
            })
        }),

        // === Search ===

        search: build.query<ContentSummaryDTO[], {query: string; types?: string}>({
            query: ({query, types}) => ({
                url: "/search",
                params: {query, types}
            }),
            transformResponse: (response: ResultsWrapper<ContentSummaryDTO>) => response.results ?? [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Search failed"
            }),
            keepUnusedDataFor: 0
        }),

        searchQuestions: build.query<ContentSummaryDTO[], QuestionSearchQuery>({
            query: (query) => ({
                url: "/pages/questions",
                params: query
            }),
            transformResponse: (response: ResultsWrapper<ContentSummaryDTO>) => response.results?.map((question) => ({
                ...question,
                url: question.url?.replace("/isaac-api/api/pages", "")
            })) ?? [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to search for questions"
            }),
            keepUnusedDataFor: 0
        }),
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
    useGetTopicSummaryQuery,
    useGetGlossaryTermsQuery,
    useLazySearchQuery,
    useLazySearchQuestionsQuery
} = contentApi;
