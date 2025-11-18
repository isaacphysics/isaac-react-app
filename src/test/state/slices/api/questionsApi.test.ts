import { QuestionSearchQuery } from "../../../../IsaacAppTypes";
import { renderTestHook } from "../../../testUtils";
import { useAppSelector, useSearchQuestionsQuery } from "../../../../app/state";
import { act, waitFor } from "@testing-library/react";
import { buildMockQuestionFinderResults, buildMockQuestions } from "../../../../mocks/utils";
import { buildFunctionHandler } from "../../../../mocks/handlers";
import { mockQuestionFinderResults } from "../../../../mocks/data";
import { useState } from "react";
import { API_PATH, SEARCH_RESULTS_PER_PAGE } from "../../../../app/services";
import { http, HttpResponse } from "msw";

describe('questions API', () => {
    it('calls the /pages/questions endpoint', async () => {
        const { handler } = await renderQuestionsQueryHook(createSearchQuery());
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('forwards any query parameters', async () => {
        const { handler } = await renderQuestionsQueryHook(createSearchQuery({ searchString: "horse" }));
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ searchString: "horse" }));
    });

    it('requests an extra question to determine whether there are more', async () => {
        const { handler } = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }));
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ limit: "6" }));
    });

    it('returns one less questions to comply with original request', async () => {
        const { response, questions } = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }));
        expect(response().data?.results).toEqual(questions.slice(0, 5));
    });

    it('indicates when there are more results', async () => {
        const { response } = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }), { totalQuestions: 10});
        expect(response().data?.moreResultsAvailable).toBe(true);
    });

    it('indicates when there are no more results', async () => {
        const { response } = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }), { totalQuestions: 5});
        expect(response().data?.moreResultsAvailable).toBe(false);
    });

    it('uses a default limit of SEARCH_RESULTS_PER_PAGE', async () => {
        const { response, handler, questions } = await renderQuestionsQueryHook(
            createSearchQuery(),
            { totalQuestions: SEARCH_RESULTS_PER_PAGE + 1}
        );
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ limit: "31" }));
        expect(response().data?.results).toEqual(questions.slice(0, SEARCH_RESULTS_PER_PAGE));
        expect(response().data?.moreResultsAvailable).toBe(true);
    });

    describe('paging', () => {
        it('appends the new page to the existing one', async () => {
            const { questions, response, setQuery } = await renderQuestionsQueryHook(
                createSearchQuery({ startIndex: 0, limit: 10 }),
                { totalQuestions: 20 }
            );
            
            expect(response().data?.results).toEqual(questions.slice(0, 10));
            expect(response().data?.moreResultsAvailable).toBe(true);

            await setQuery(createSearchQuery({ startIndex: 10, limit: 10  }));

            expect(response().data?.results).toEqual(questions);
            expect(response().data?.moreResultsAvailable).toBe(false);
        });

        it('starts a new page when a filter parameter changes', async () => {
            const { questions, response, setQuery } = await renderQuestionsQueryHook(
                createSearchQuery({ searchString: "horse", startIndex: 0, limit: 10 }),
                { totalQuestions: 20 }
            );
            
            expect(response().data?.results).toEqual(questions.slice(0, 10));
            expect(response().data?.moreResultsAvailable).toBe(true);

            await setQuery(createSearchQuery({ searchString: "vs", startIndex: 0, limit: 10  }));

            expect(response().data?.results).toEqual(questions.slice(0, 10));
            expect(response().data?.moreResultsAvailable).toBe(true);
        });
    });

    describe('when there was an error', () => {
        it('indicates this in the response', async () => {
            const { result } = await renderQuestionsQueryHookFailure();
            expect(result.current.result.isError).toBe(true);
            expect(result.current.result.error).toHaveProperty('status', 401);
            expect(result.current.result.data).toBe(undefined);
        });

        it('shows a toast notification that mentions this endpoint', async () => {
            const { result } = await renderQuestionsQueryHookFailure();
            expect(result.current.toasts).toHaveLength(1);
            expect(result.current.toasts).toHaveProperty('[0].title', 'Unable to search for questions');
        });
    });
});

const renderQuestionsQueryHook = async (
    initialQuery: QuestionSearchQuery,
    { totalQuestions } = { totalQuestions: 10}
) => {
    const questions = buildMockQuestions(totalQuestions, mockQuestionFinderResults);
    const useTest = () => {
        const [query, setQuery] = useState(createSearchQuery(initialQuery));
        const response = useSearchQuestionsQuery(query);
        return { response, setQuery } as const;
    };
    const handler = jest.fn(({ startIndex, limit } : { startIndex: string, limit: string }) => {
        return buildMockQuestionFinderResults(questions, parseInt(startIndex), parseInt(limit));
    });
            
    const { result } = renderTestHook(useTest, { extraEndpoints: [
        buildFunctionHandler('/pages/questions', ['startIndex', 'limit', 'searchString'], handler)
    ]});
    
    await waitFor(() => expect(result.current.response.isFetching).toBe(false));
    
    const response = () => result.current.response;
    const setQuery = async (query: QuestionSearchQuery) => {
        await act(async() => result.current.setQuery(query));
        await waitFor(() => expect(response().isFetching).toBe(false));
    };
    return { handler, questions, response, setQuery };            
};

const renderQuestionsQueryHookFailure = async () => {
    const useTest = () => {
        const toasts = useAppSelector(state => state?.toasts || []);
        const result = useSearchQuestionsQuery(createSearchQuery());
        return { toasts, result };
    };
    const handler = http.get(
        API_PATH + "/pages/questions",
        () => HttpResponse.json({ error: 'Not Authorized' }, { status: 401 })
    );
            
    const { result } = renderTestHook(useTest, { extraEndpoints: [handler]});
    await waitFor(() => expect(result.current.result.isFetching).toBe(false));
    
    return { result };
};

const createSearchQuery = (
    {limit, searchString, startIndex = 0} : { limit?: number, searchString?: string, startIndex?: number } = { }
): QuestionSearchQuery => {
    return {
        querySource: "questionFinder",
        startIndex, limit, searchString      
    };
};
