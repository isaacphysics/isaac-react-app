import {act, screen, waitFor, within} from "@testing-library/react";
import { clickOn, enterInput, expectUrlParams, renderTestEnvironment, setUrl, withMockedRandom} from "../testUtils";
import { mockQuestionFinderResults, mockQuestionFinderResultsWithMultipleStages } from "../../mocks/data";
import shuffle from "lodash/shuffle";
import { buildFunctionHandler } from "../../mocks/handlers";
import { isPhy, siteSpecific } from "../../app/services";
import userEvent from "@testing-library/user-event";
import { PageContextState } from "../../IsaacAppTypes";
import { expectPhyBreadCrumbs } from "../helpers/quiz";
import { IsaacQuestionPageDTO } from "../../IsaacApiTypes";
import { toggleFilter, BoxSelectionState, Filters, setTestFilters } from "../../mocks/filters";

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
    const { GCSE } = Filters;

    const questions = buildMockQuestions(40, mockQuestionFinderResults as QuestionFinderResultsResponse);
    const resultsResponse = buildMockQuestionFinderResults(questions, 0);

    const questionsWithMultipleStages = buildMockQuestions(40, mockQuestionFinderResultsWithMultipleStages as QuestionFinderResultsResponse);
    const resultsResponseWithMultipleStages = buildMockQuestionFinderResults(questionsWithMultipleStages, 0);

    const renderQuestionFinderPage = async ({questionsSearchResponse, queryParams, context} : RenderParameters) => {
        await act(async () => {
            renderTestEnvironment({
                extraEndpoints: [buildFunctionHandler('/pages/questions', ['tags', 'stages', 'randomSeed', 'startIndex'], questionsSearchResponse)]
            });
            setUrl({ pathname: context ? `/${context.subject}/${context.stage?.[0]}/questions` : '/questions', search: queryParams });
        });
    };

    it('should render results in alphabetical order', async () => {
        await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
        await toggleFilter(GCSE);
        await expectQuestions(questions.slice(0, 30));
    });

    describe('Question shuffling', () => {
        const shuffledQuestions = shuffle(questions);
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
                   
                await toggleFilter(GCSE);
                await expectQuestions(questions.slice(0, 30));
                    
                await clickOn("Shuffle questions");
                await expectQuestions(shuffledQuestions.slice(0, 30));
            });
        });

        it('button stores the seed in a URL parameter', () => {
            return withMockedRandom(async (randomSequence) => {
                randomSequence([1 * 10 ** -6]);
                   
                await renderQuestionFinderPage({ questionsSearchResponse });
                await toggleFilter(GCSE);
                await clickOn("Shuffle questions");
                await expectUrlParams("?randomSeed=1&stages=gcse");
            });
        });

        describe('returning to alphabetical order from a randomised screen', () => {                
            it('when applying filters', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1" });
                await toggleFilter(GCSE);
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
                await toggleFilter(GCSE);
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
    });

    if (isPhy) {
        describe('Filters: Parent reselection', () => {
            const { Selected, Partial, Deselected, Hidden } = BoxSelectionState;
            const { Physics, Skills, Mechanics, SigFig, Maths, Number, Arithmetic, Geometry, Shapes } = Filters;

            it('reselects parent topic after unselecting subtopics', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
                // Physics -> Skills
                //         -> Mechanics
                const toggleAssert = setTestFilters([Physics, Skills, Mechanics]);

                await toggleAssert([], [Deselected, Hidden, Hidden]);
                await toggleAssert([Physics], [Selected, Deselected, Deselected]);
                await toggleAssert([Skills, Mechanics], [Partial, Selected, Selected]);
                await toggleAssert([Skills, Mechanics], [Selected, Deselected, Deselected]);
                await toggleAssert([Physics], [Deselected, Hidden, Hidden]);
            });

            it('works on nested topics', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
                // Physics -> Skills -> Significant Figures
                const toggleAssert = setTestFilters([Physics, Skills, SigFig]);

                await toggleAssert([], [Deselected, Hidden, Hidden]);
                await toggleAssert([Physics], [Selected, Deselected, Hidden]);
                await toggleAssert([Skills], [Partial, Selected, Deselected]);
                await toggleAssert([SigFig], [Partial, Partial, Selected]);
                await toggleAssert([SigFig], [Partial, Selected, Deselected]);
                await toggleAssert([Skills], [Selected, Deselected, Hidden]);
                await toggleAssert([Physics], [Deselected, Hidden, Hidden]);
            });

            it('work when multiple parents are selected', async () => {
                await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
                // Physics -> Skills
                // Maths -> Number
                const toggleAssert = setTestFilters([Physics, Skills, Maths, Number]);
                
                await toggleAssert([], [Deselected, Hidden, Deselected, Hidden]);
                await toggleAssert([Physics, Maths], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Skills, Number], [Partial, Selected, Partial, Selected]);
                await toggleAssert([Skills, Number], [Selected, Deselected, Selected, Deselected]);
                await toggleAssert([Physics, Maths], [Deselected, Hidden, Deselected, Hidden]);
            });

            describe('on a conxtext-specific question finder', () => {
                it('reselects parent topic after unselecting subtopics, multiple parents', async () => {
                    await renderQuestionFinderPage({ 
                        questionsSearchResponse: () => resultsResponse, 
                        context: { subject: "maths", stage: ["a_level"] },
                    });
                    // Number -> Arithmetic
                    // Geometry -> Shapes
                    const toggleAssert = setTestFilters([Number, Arithmetic, Geometry, Shapes]);
                
                    await toggleAssert([], [Deselected, Hidden, Deselected, Hidden]);
                    await toggleAssert([Number, Geometry], [Selected, Deselected, Selected, Deselected]);
                    await toggleAssert([Arithmetic, Shapes], [Partial, Selected, Partial, Selected]);
                    await toggleAssert([Arithmetic, Shapes], [Selected, Deselected, Selected, Deselected]);
                    await toggleAssert([Number, Geometry], [Deselected, Hidden, Deselected, Hidden]);
                });
            });
        });
    }

    describe('Context-specific question finders', () => {
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
                    stages: "a_level,further_a",
                })));
            });

            it('"Load more" on a context-specific question finder should still only load questions for that context', async () => {
                const getQuestionsWithMultipleStages = jest.fn(() => resultsResponseWithMultipleStages);

                await renderQuestionFinderPage({ 
                    questionsSearchResponse: getQuestionsWithMultipleStages, 
                    context: { subject: "physics", stage: ["a_level"] },
                });

                await clickOn("Load more");

                await waitFor(() => expect(getQuestionsWithMultipleStages).toHaveBeenLastCalledWith(expect.objectContaining({
                    tags: "physics",
                    stages: "a_level,further_a",
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


const findQuestions = () => screen.findByTestId("question-finder-results").then(e => within(e).findAllByRole('listitem'));

const getQuestionText = (q: HTMLElement) => q.querySelector(isPhy ? '.question-link-title > span' : 'span.question-link-title')?.textContent;

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
