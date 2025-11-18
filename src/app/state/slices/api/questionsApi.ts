import { ContentSummaryDTO, IsaacQuestionPageDTO, SearchResultsWrapper } from "../../../../IsaacApiTypes";
import { CanAttemptQuestionTypeDTO, QuestionSearchQuery } from "../../../../IsaacAppTypes";
import { isDefined, SEARCH_RESULTS_PER_PAGE, tags } from "../../../services";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export interface QuestionSearchResponseType {
    results?: ContentSummaryDTO[];
    totalResults?: number;
    nextSearchOffset?: number;
    moreResultsAvailable?: boolean; // frontend only; calculated in transformResponse
}

export const questionsApi = isaacApi.enhanceEndpoints({addTagTypes: ["CanAttemptQuestionType"]}).injectEndpoints({
    endpoints: (build) => ({
        searchQuestions: build.query<QuestionSearchResponseType, QuestionSearchQuery>({
            query: (search) => ({
                url: `/pages/questions`,
                params: {
                    ...search,
                    limit: (search.limit ?? SEARCH_RESULTS_PER_PAGE) + 1 // fetch one extra to check if more results are available
                }
            }),
            serializeQueryArgs: (args) => {
                const { queryArgs, ...rest } = args;
                const { startIndex: _startIndex, ...otherParams } = queryArgs;
                // So that different queries with different pagination params still share the same cache
                return {
                    ...rest,
                    queryArgs: otherParams
                };
            },
            transformResponse: (response: SearchResultsWrapper<ContentSummaryDTO>, _, args) => {
                return {
                    ...response,
                    // remove the extra result used to check for more results, so that we return the correct amount
                    moreResultsAvailable: isDefined(response.results) ? response.results.length > (args.limit ?? SEARCH_RESULTS_PER_PAGE) : undefined,
                    results: response.results?.slice(0, args.limit ?? SEARCH_RESULTS_PER_PAGE)
                };
            },
            merge: (currentCache, newItems) => {
                if (currentCache.results) {
                    currentCache.results.push(...(newItems.results ?? []));
                } else {
                    currentCache.results = newItems.results;
                }
                currentCache.totalResults = newItems.totalResults;
                currentCache.nextSearchOffset = newItems.nextSearchOffset;
                currentCache.moreResultsAvailable = newItems.moreResultsAvailable;
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg !== previousArg;
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to search for questions",
            }),
        }),

        getQuestion: build.query<IsaacQuestionPageDTO, string>({
            query: (id) => ({
                url: `/pages/questions/${id}`
            }),
            transformResponse: (response: IsaacQuestionPageDTO) => {
                return tags.augmentDocWithSubject(response);
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load question",
                onQueryStart: (_args, {dispatch}) => {
                    dispatch(docSlice.actions.resetPage());
                },
                onQuerySuccess: (_args, response, {dispatch}) => {
                    dispatch(docSlice.actions.updatePage({ doc: response }));
                }
            }),
        }),
        canAttemptQuestionType: build.query<CanAttemptQuestionTypeDTO, string>({
            query: (questionType) => `/questions/${questionType}/can_attempt`,
            providesTags: (_result, _error, questionType) => [{ type: 'CanAttemptQuestionType', id: questionType }]
        })
    })
});

export const {
    useSearchQuestionsQuery,
    useLazySearchQuestionsQuery,
    useGetQuestionQuery,
    useCanAttemptQuestionTypeQuery,
} = questionsApi;
