import {act, screen, waitFor, within} from "@testing-library/react";
import { clickOn, enterInput, expectUrlParams, renderTestEnvironment, setUrl, withMockedRandom} from "../testUtils";
import { mockQuestionFinderResults, mockQuestionFinderResultsWithMultipleStages } from "../../mocks/data";
import _ from "lodash";
import { buildFunctionHandler } from "../../mocks/handlers";
import { isPhy, siteSpecific } from "../../app/services";
import userEvent from "@testing-library/user-event";
import { PageContextState } from "../../IsaacAppTypes";
import { expectPhyBreadCrumbs } from "../helpers/quiz";
import { IsaacQuestionPageDTO } from "../../IsaacApiTypes";

type QuestionFinderResultsResponse = {
    results: IsaacQuestionPageDTO[];
    nextSearchOffset: number;
    totalResults: number;
};

const buildMockQuestions = (n: number, questions: QuestionFinderResultsResponse): IsaacQuestionPageDTO[] => {
    return Array(n).fill(null).map((_, i) => ({ ...questions.results[i % questions.results.length], id: `q${i}`, title: `Question ${i}: ${questions.results[i % questions.results.length].title}` }));
};

const buildMockQuestionFinderResults = <T extends IsaacQuestionPageDTO[]>(questions: T, start: number): QuestionFinderResultsResponse => ({
    results: questions.slice(start, start + 31),
    nextSearchOffset: start + 31,
    totalResults: questions.length
});

describe("QuestionFinder", () => {
    const questions = buildMockQuestions(40, mockQuestionFinderResults as QuestionFinderResultsResponse);
    const resultsResponse = buildMockQuestionFinderResults(questions, 0);

    const questionsWithMultipleStages = buildMockQuestions(40, mockQuestionFinderResultsWithMultipleStages as QuestionFinderResultsResponse);
    const resultsResponseWithMultipleStages = buildMockQuestionFinderResults(questionsWithMultipleStages, 0);

    const renderQuestionFinderPage = async ({questionsSearchResponse, queryParams, context} : RenderParameters) => {
        await act(async () => {
            renderTestEnvironment({
                extraEndpoints: [buildFunctionHandler('/pages/questions', ['tags', 'stages', 'randomSeed', 'startIndex'], questionsSearchResponse)]
            });
            setUrl({ pathname: context ? `${context.subject}/${context.stage?.[0]}/questions` : '/questions', search: queryParams });
        });
    };

    it('should render results in alphabetical order', async () => {
        await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
        await setFilter("GCSE");
        await expectQuestions(questions.slice(0, 30));
    });

    describe('Question shuffling', () => {
        const shuffledQuestions = _.shuffle(questions);
        const shuffledResultsResponse = buildMockQuestionFinderResults(shuffledQuestions, 0);

        const questionsSearchResponse: RenderParameters['questionsSearchResponse'] = ({randomSeed}) => {
            switch (randomSeed) {
                case null: return resultsResponse;
                case '1': return shuffledResultsResponse;
                default: throw new Error('Unexpected seed.');
            }
        };

        it('query parameter should shuffle results', async () => {
            await renderQuestionFinderPage({ questionsSearchResponse, queryParams: '?randomSeed=1&stages=gcse' });
            await expectQuestions(shuffledQuestions.slice(0, 30));
        });
            
        it('button should shuffle questions', async () => {
            await withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);
                await renderQuestionFinderPage({ questionsSearchResponse });
                   
                await setFilter("GCSE");
                await expectQuestions(questions.slice(0, 30));
                    
                await clickOn("Shuffle questions");
                await expectQuestions(shuffledQuestions.slice(0, 30));
            });
        });

        it('button stores the seed in a URL parameter', () => {
            return withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);
                   
                await renderQuestionFinderPage({ questionsSearchResponse });
                await setFilter("GCSE");
                await clickOn("Shuffle questions");
                await expectUrlParams("?randomSeed=1&stages=gcse");
            });
        });

        describe('returning to alphabetical order from a randomised screen', () => {                
            it('when applying filters', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1" });
                await setFilter("GCSE");
                await expectUrlParams("?stages=gcse");
                await expectQuestions(questions.slice(0, 30));
            });
    
            it('when searching for a question', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1" });
                await enterInput(siteSpecific("e.g. Man vs. Horse", "e.g. Creating an AST"), "A bag");
                await expectUrlParams("?query=A%20bag");
                await expectQuestions(questions.slice(0, 30));
            });

            if (isPhy) {
                // On Ada, clearing filters only has an affect after clicking the "Apply" button, so same case as above 
                it.skip('when clearing all filters', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1&stages=gcse" });
                    await clickOn(siteSpecific("Clear all filters", "Clear all"));
                    await expectUrlParams('');
                });

                // This test is currently flaky (fails every 10th execution, but the variance is really wild).
                // I believe the flakiness is caused by the implementation, which nests the component definition functions
                // for FilterTag and FilterSummary. The React docs advise against this, see:
                // https://react.dev/learn/preserving-and-resetting-state  
                it.skip('when clearing a filter tag', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1&stages=gcse" });
                    await clearFilterTag('gcse');
                    await expectUrlParams('');
                });
            }
        });
            
        it('"Load more" should avoid duplicate questions by fetching next page using same seed', () => {
            const resultsResponsePage2 = buildMockQuestionFinderResults(questions, 30);
            const shuffledResultsResponsePage2 = buildMockQuestionFinderResults(shuffledQuestions, 30);

            return withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);
                   
                await renderQuestionFinderPage({ questionsSearchResponse: ({ randomSeed, startIndex }) => {
                    switch (randomSeed) {
                        case null: return startIndex === '0' ? resultsResponse : resultsResponsePage2;;
                        case '1': return startIndex === '0' ? shuffledResultsResponse : shuffledResultsResponsePage2;
                        default: throw new Error('Unexpected seed');
                    }
                }});
                await setFilter("GCSE");
                await expectQuestions(questions.slice(0, 30));
                await expectPageIndicator("Showing 30 of 40.");
                    
                await clickOn("Shuffle questions");
                await expectQuestions(shuffledQuestions.slice(0, 30));
                await expectPageIndicator("Showing 30 of 40.");

                await clickOn("Load more");
                await expectQuestions(shuffledQuestions);
                await expectPageIndicator("Showing 40 of 40.");
            });
        });

        if (isPhy) {
            it('Context-specific question finders should lead back to the relevant landing page in the breadcrumb', async () => {
                await renderQuestionFinderPage({ 
                    questionsSearchResponse: () => resultsResponse, 
                    context: { subject: "physics", stage: ["gcse"] },
                });
                expectPhyBreadCrumbs({href: "/physics/gcse", text: "GCSE Physics"});
            });

            it('Context-specific question finders should only load questions for that context', async () => {
                const getQuestionsWithMultipleStages = jest.fn(() => resultsResponseWithMultipleStages);

                await renderQuestionFinderPage({ 
                    questionsSearchResponse: getQuestionsWithMultipleStages, 
                    context: { subject: "physics", stage: ["a_level"] },
                });

                await waitFor(() => expect(getQuestionsWithMultipleStages).toHaveBeenCalledWith(expect.objectContaining({
                    tags: "physics",
                    stages: "a_level",
                })));
            });

            it('"Load more" on a context-specific question finders should still only load questions for that context', async () => {
                const getQuestionsWithMultipleStages = jest.fn(() => resultsResponseWithMultipleStages);

                await renderQuestionFinderPage({ 
                    questionsSearchResponse: getQuestionsWithMultipleStages, 
                    context: { subject: "physics", stage: ["a_level"] },
                });

                await clickOn("Load more");

                await waitFor(() => expect(getQuestionsWithMultipleStages).toHaveBeenLastCalledWith(expect.objectContaining({
                    tags: "physics",
                    stages: "a_level",
                })));
            });
        }
    });
});

type RenderParameters = {
    questionsSearchResponse: (options: {
        tags: string | null;
        stages: string | null;
        randomSeed: string | null;
        startIndex: string | null;
    }) => QuestionFinderResultsResponse;
    queryParams?: string;
    context?: NonNullable<PageContextState>;
};

const mainContainer = () => screen.findByTestId('main');

const findQuestions = () => screen.findByTestId("question-finder-results").then(e => within(e).findAllByRole('listitem'));

const getQuestionText = (q: HTMLElement) => q.querySelector(isPhy ? 'span' : 'span.question-link-title')?.textContent;

const expectQuestions = (expectedQuestions: IsaacQuestionPageDTO[]) => waitFor(async () => {
    const found = await findQuestions();
    expect(found.length).toEqual(expectedQuestions.length);
    expect(found.map(getQuestionText)).toEqual(expectedQuestions.map(q => q.title));
}, { timeout: 5000 });

const expectPageIndicator = (content: string) => screen.findByTestId("question-finder-results").then(found => {
    expect(found.querySelectorAll('.col')[0].textContent).toBe(content);
});

const clearFilterTag = async (tagId: string) => {
    const tag = await screen.findByTestId(`filter-tag-${tagId}`);
    const button = await within(tag).findByRole('button');
    await userEvent.click(button);
};

const setFilter = async (filter: string) => {
    if (isPhy) {
        await clickOn(filter, mainContainer());
    } else {
        await clickOn(filter);
        await clickOn("Apply filters");
    }
};
