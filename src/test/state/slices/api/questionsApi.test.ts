import { QuestionSearchQuery } from "../../../../IsaacAppTypes";
import { renderTestHook } from "../../../testUtils";
import { useSearchQuestionsQuery } from "../../../../app/state";
import { act, waitFor } from "@testing-library/react";
import { buildMockQuestionFinderResults, buildMockQuestions } from "../../../../mocks/utils";
import { buildFunctionHandler } from "../../../../mocks/handlers";
import { HttpHandler } from "msw";
import { mockQuestionFinderResults } from "../../../../mocks/data";
import { useState } from "react";

describe('questions API', () => {
    it('calls the /pages/questions endpoint', async () => {
        const q0 = nQuestions(0);
        await renderQuestionsQueryHook(createSearchQuery(), q0.handler);
        expect(q0.handlerMock).toHaveBeenCalledTimes(1);
    });

    it('forwards any query parameters', async () => {
        const q0 = nQuestions(0);
        await renderQuestionsQueryHook(createSearchQuery({ searchString: "horse" }), q0.handler);
        expect(q0.handlerMock).toHaveBeenCalledTimes(1);
        expect(q0.handlerMock).toHaveBeenCalledWith(expect.objectContaining({ searchString: "horse" }));
    });

    it('requests an extra question to determine whether there are more', async () => {
        const q6 = nQuestions(6);
        await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }), q6.handler);
        expect(q6.handlerMock).toHaveBeenCalledTimes(1);
        expect(q6.handlerMock).toHaveBeenCalledWith(expect.objectContaining({ limit: "6" }));
    });

    it('returns one less questions to comply with original request', async () => {
        const q6 = nQuestions(6);
        const result = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }), q6.handler);
        expect(result.data?.results).toEqual(q6.questions.slice(0, 5));
    });

    it('indicates whether there are more results', async () => {
        const q6 = nQuestions(6);
        const result = await renderQuestionsQueryHook(createSearchQuery({ limit: 5 }), q6.handler);
        expect(result.data?.moreResultsAvailable).toBe(true);
    });

    it ('uses a default limit of SEARCH_RESULTS_PER_PAGE', async () => {
        const q35 = nQuestions(35);
        const result = await renderQuestionsQueryHook(createSearchQuery(), q35.handler);
        expect(q35.handlerMock).toHaveBeenCalledTimes(1);
        expect(q35.handlerMock).toHaveBeenCalledWith(expect.objectContaining({ limit: "31" }));
        expect(result.data?.results).toEqual(q35.questions.slice(0, 30));
        expect(result.data?.moreResultsAvailable).toBe(true);
    });

    describe('when paging through results', () => {
        it('appends the new page to the existing one', async () => {
            const questions = buildMockQuestions(20, mockQuestionFinderResults);
            
            const handler = buildFunctionHandler('/pages/questions', ['startIndex', 'limit'], ({ startIndex, limit }) => {
                return buildMockQuestionFinderResults(questions, parseInt(startIndex), parseInt(limit));
            });

            const useTest = () => {
                const [query, setQuery] = useState<QuestionSearchQuery>(createSearchQuery({ limit: 10 }));
                const response = useSearchQuestionsQuery(query);
                return { response, setQuery } as const;
            };
            
            const { result } = renderTestHook(useTest, { extraEndpoints: [handler] });
            await waitFor(() => expect(result.current.response.isFetching).toBe(false));
            
            expect(result.current.response.data?.results).toEqual(questions.slice(0, 10));
            expect(result.current.response.data?.moreResultsAvailable).toBe(true);

            await act(async() => result.current.setQuery(createSearchQuery({ limit: 10, startIndex: 10 })));
            await waitFor(() => expect(result.current.response.isFetching).toBe(false));

            expect(result.current.response.data?.results).toEqual(questions);
            expect(result.current.response.data?.moreResultsAvailable).toBe(false);
        });
    });
});


const renderQuestionsQueryHook = async (query: QuestionSearchQuery, handler: HttpHandler) => {
    const useTest = () => {
        return useSearchQuestionsQuery(query);
    };
    const { result } = renderTestHook(useTest, { extraEndpoints: [handler] });
    await waitFor(() => expect(result.current.isFetching).toBe(false));
    return result.current;            
};

const createSearchQuery = ({limit, searchString, startIndex = 0} : { limit?: number, searchString?: string, startIndex?: number } = { }): QuestionSearchQuery => {
    return {
        querySource: "questionFinder",
        startIndex, limit, searchString      
    };
};

const nQuestions = (n: number) => {
    const questions = buildMockQuestions(n, mockQuestionFinderResults);
    const handlerMock = jest.fn(() => buildMockQuestionFinderResults(questions, 0));
    const handler = buildFunctionHandler('/pages/questions', ['limit', 'searchString'], handlerMock );
    return { handler, handlerMock, questions };  
}; 