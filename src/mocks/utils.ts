import { persistence, SEARCH_RESULTS_PER_PAGE } from "../app/services";
import { ContentSummaryDTO, SearchResultsWrapper } from "../IsaacApiTypes";

// this makes sure `elem` implements an interface without widening its type
export const recordOf = <T extends string | number | symbol, U>() => <V extends U>(elem: Record<T, V>) => elem;

export const mockPersistence = () => {
    const fakeStorage = new Map<string, string>();

    beforeAll(() => {
        jest.spyOn(persistence, 'load').mockImplementation((key: string) => fakeStorage.get(key) || null);
        jest.spyOn(persistence, 'save').mockImplementation((key: string, value: string) => {
            fakeStorage.set(key, value);
            return true;
        });
        jest.spyOn(persistence, 'remove').mockImplementation((key: string) => {
            fakeStorage.delete(key);
            return true;
        });
    });

    afterAll(() => {
        jest.resetAllMocks();
    });
}; 

export const buildMockQuestions = (n: number, questions: SearchResultsWrapper<ContentSummaryDTO>): ContentSummaryDTO[] => {
    return Array(n).fill(null).map((_, i) => ({ ...questions.results?.[i % questions.results.length], id: `q${i}`, title: `Question ${i}: ${questions.results?.[i % questions.results.length].title}` }));
};

export const buildMockQuestionFinderResults = <T extends ContentSummaryDTO[]>(questions: T, start: number, limit = SEARCH_RESULTS_PER_PAGE): SearchResultsWrapper<ContentSummaryDTO> => ({
    results: questions.slice(start, start + limit + 1),
    nextSearchOffset: start + limit + 1,
    totalResults: questions.length,
});
