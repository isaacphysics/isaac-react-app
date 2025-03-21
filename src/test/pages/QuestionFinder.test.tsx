import {act, screen, waitFor, within} from "@testing-library/react";
import { clickButton, enterInput, expectUrlParams, renderTestEnvironment, setUrl, withMockedRandom} from "../testUtils";
import { buildMockQuestionFinderResults, buildMockQuestions, mockQuestionFinderResults } from "../../mocks/data";
import _ from "lodash";
import { buildFunctionHandler } from "../../mocks/handlers";
import { isAda } from "../../app/services";
import userEvent from "@testing-library/user-event";

describe("QuestionFinder", () => {
    if (isAda) {
        it('does not matter', () => {});
    } else {        
        const questions = buildMockQuestions(40);
        const resultsResponse = buildMockQuestionFinderResults(questions, 0);               
        
        const renderQuestionFinderPage = async ({questionsSearchResponse, queryParams} : RenderParameters) => {
            await act(async () => {
                renderTestEnvironment({
                    extraEndpoints: [buildFunctionHandler('/pages/questions', ['randomSeed', 'startIndex'], questionsSearchResponse)]
                    
                });
                setUrl({ pathname: '/questions', search: queryParams });
            });
        };

        it('should render results in alphabetical order', async () => {
            await renderQuestionFinderPage({ questionsSearchResponse: () => resultsResponse });
            await clickButton("Year 7&8");
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
                await renderQuestionFinderPage({ questionsSearchResponse, queryParams: '?stages=year_7_and_8&randomSeed=1' });
                await expectQuestions(shuffledQuestions.slice(0, 30));
            });
            
            it('button should shuffle questions', async () => {
                await withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                    await renderQuestionFinderPage({ questionsSearchResponse });
                   
                    await clickButton("Year 7&8");
                    await expectQuestions(questions.slice(0, 30));
                    
                    await clickButton("Shuffle questions");
                    await expectQuestions(shuffledQuestions.slice(0, 30));
                });
            });

            it('button stores the seed in a URL parameter', () => {
                return withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                   
                    await renderQuestionFinderPage({ questionsSearchResponse });
                    await clickButton("Year 7&8");
                    await clickButton("Shuffle questions");
                    expectUrlParams("?randomSeed=1&stages=year_7_and_8");
                });
            });

            describe('returning to alphabetical order from a randomised screen', () => {                
                it('when applying filters', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1" });
                    await clickButton("Year 7&8");
                    expectUrlParams("?stages=year_7_and_8");
                    await expectQuestions(questions.slice(0, 30));
                });
    
                it('when searching for a question', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1" });
                    await enterInput("e.g. Man vs. Horse", "A bag");
                    expectUrlParams("?query=A%20bag");
                    await expectQuestions(questions.slice(0, 30));

                });

                it('when clearing all filters', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1&stages=year_7_and_8" });
                    await clickButton("Clear all filters");
                    expectUrlParams('');
                });

                it('when clearing a filter tag', async () => {
                    await renderQuestionFinderPage({ questionsSearchResponse, queryParams: "?randomSeed=1&stages=year_9" });
                    await clearFilterTag('year_9');
                    expectUrlParams('');
                });
            });

            
            it('"Load more" should avoid duplicate questions by fetching next page using same seed', () => {
                const resultsResponsePage2 = buildMockQuestionFinderResults(questions, 30);
                const shuffledResultsResponsePage2 = buildMockQuestionFinderResults(shuffledQuestions, 30);

                return withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                   
                    await renderQuestionFinderPage({ questionsSearchResponse: ({ randomSeed, startIndex }) => {
                        switch (randomSeed) {
                            case null: return startIndex === '0' ? resultsResponse : resultsResponsePage2;;
                            case '1': return startIndex === '0' ? shuffledResultsResponse : shuffledResultsResponsePage2;
                            default: throw new Error('Unexpected seed');
                        }
                    }});
                    await clickButton("Year 7&8");
                    await expectQuestions(questions.slice(0, 30));
                    await expectPageIndicator("Showing 30 of 40.");
                    
                    await clickButton("Shuffle questions");
                    await expectQuestions(shuffledQuestions.slice(0, 30));
                    await expectPageIndicator("Showing 30 of 40.");

                    await clickButton("Load more");
                    await expectQuestions(shuffledQuestions);
                    await expectPageIndicator("Showing 40 of 40.");
                });
            });
        });
    }                                                                                              
});

type RenderParameters = {
    questionsSearchResponse: (options: {
        randomSeed: string | null;
        startIndex: string | null;
    }) => typeof mockQuestionFinderResults;
    queryParams?: string;
};

const findQuestions = () => screen.findByTestId("question-finder-results").then(e => within(e).findAllByRole('listitem'));

const getQuestionText = (q: HTMLElement) => q.querySelector('span')?.textContent;

const expectQuestions = async (expectedQuestions: typeof mockQuestionFinderResults.results) => {
    await waitForQuestions(expectedQuestions.length);
    const found = await findQuestions();
    expect(found.length).toEqual(expectedQuestions.length);
    expect(found.map(getQuestionText)).toEqual(expectedQuestions.map(q => q.title));
};

const expectPageIndicator = (content: string) => screen.findByTestId("question-finder-results").then(found => {
    expect(found.querySelectorAll('.col')[0].textContent).toBe(content);
});

const waitForQuestions = (length: number) => waitFor(async () => {
    return expect(await findQuestions()).toHaveLength(length);
});

const clearFilterTag = async (tagId: string) =>  {
    const tag = await screen.findByTestId(`filter-tag-${tagId}`);
    const button = await within(tag).findByRole('button');
    return userEvent.click(button);
};