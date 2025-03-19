import {screen, waitFor, within} from "@testing-library/react";
import { clickButton, renderTestEnvironment, withMockedRandom} from "../testUtils";
import { buildMockQuestionFinderResults, buildMockQuestions, mockQuestionFinderResults } from "../../mocks/data";
import { http, HttpResponse } from "msw";
import { API_PATH, isAda } from "../../app/services";
import _ from "lodash";

describe("QuestionFinder", () => {
    if (isAda) {
        it('does not matter', () => {});
    } else {        
        const findQuestions = () => screen.findByTestId("question-finder-results").then(elem => within(elem).findAllByRole('listitem'));
        const getQuestionText = (q: HTMLElement) => q.querySelector('span')?.textContent;
        const expectQuestions = (expectedQuestions: typeof mockQuestionFinderResults.results) => findQuestions().then((found) => { 
            expect(found.length).toEqual(expectedQuestions.length);
            expect(found.map(getQuestionText)).toEqual(expectedQuestions.map(q => q.title));
        });
        const expectPageIndicator = (content: string) => screen.findByTestId("question-finder-results").then(found => {
            expect(found.querySelectorAll('.col')[0].textContent).toBe(content);
        });
        const waitForQuestions = (length?: number) => waitFor(async () => {
            if (length === undefined) {
                return expect(await findQuestions()).not.toHaveLength(0);
            }
            return expect(await findQuestions()).toHaveLength(length);
        });

        const questions = buildMockQuestions(40);
        const resultsResponse = buildMockQuestionFinderResults(questions, 0);               
        
        const renderQuestionFinderPage = async ({searchResponse} : RenderParameters) => {          
            renderTestEnvironment({
                extraEndpoints: [
                    http.get(API_PATH + "/pages/questions/", async ({ request }) => {
                        const randomSeed = new URL(request.url).searchParams.get('randomSeed');
                        const startIndex = new URL(request.url).searchParams.get('startIndex');
                        return HttpResponse.json(searchResponse({ randomSeed, startIndex }), { status: 200, });
                    })
                ]
            });
            await clickButton("Question finder");
        };

        it('should render results in alphabetical order', async () => {
            await renderQuestionFinderPage({
                searchResponse: () => resultsResponse
            });
            await clickButton("Year 7&8");
            await expectQuestions(resultsResponse.results.slice(0, 30));
        });

        describe('Question shuffling', () => {
            const shuffledQuestions = _.shuffle(questions);
            const shuffledResultsResponse = buildMockQuestionFinderResults(shuffledQuestions, 0);

            const searchResponse: RenderParameters['searchResponse'] = ({randomSeed}) => {
                switch (randomSeed) {
                    case null: return resultsResponse;
                    case '1': return { ...shuffledResultsResponse, results: shuffledResultsResponse.results };
                    default: throw new Error('Unexpected seed.');
                }
            };
            
            it('button should shuffle questions', () => {
                return withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                   
                    await renderQuestionFinderPage({ searchResponse });
                    await clickButton("Year 7&8");
                    await waitForQuestions();
                    await expectQuestions(resultsResponse.results.slice(0, 30));
                    
                    await clickButton("Shuffle questions");
                    await waitForQuestions();
                    await expectQuestions(shuffledResultsResponse.results.slice(0, 30));
                });
            });

            it('after using button, applying filters should return to alphabetical order', () => {
                return withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                    
                    await renderQuestionFinderPage({ searchResponse });
                    await clickButton("Shuffle questions");
                    await clickButton("Year 7&8");
                    await waitForQuestions();
                    await expectQuestions(resultsResponse.results.slice(0, 30));
                });
            });

            it('"Load more" should avoid duplicate questions by fetching next page from same order', () => {
                const resultsResponsePage2 = buildMockQuestionFinderResults(questions, 30);
                const shuffledResultsResponsePage2 = buildMockQuestionFinderResults(shuffledQuestions, 30);

                return withMockedRandom(async (nextRandom) => {
                    nextRandom([1 * 10 ** -6]);
                   
                    await renderQuestionFinderPage({ searchResponse: ({ randomSeed, startIndex }) => {
                        switch (randomSeed) {
                            case null: return startIndex === '0' ? resultsResponse : resultsResponsePage2;;
                            case '1': return startIndex === '0' ? shuffledResultsResponse : shuffledResultsResponsePage2;
                            default: throw new Error('Unexpected seed');
                        }
                    }});
                    await clickButton("Year 7&8");
                    await waitForQuestions();
                    await expectQuestions(resultsResponse.results.slice(0, 30));
                    await expectPageIndicator("Showing 30 of 40.");
                    
                    await clickButton("Shuffle questions");
                    await waitForQuestions();
                    await expectPageIndicator("Showing 30 of 40.");
                    await expectQuestions(shuffledResultsResponse.results.slice(0, 30));

                    await clickButton("Load more");
                    await waitForQuestions(shuffledQuestions.length);
                    await expectPageIndicator("Showing 40 of 40.");
                    await expectQuestions(shuffledQuestions);
                });
            });
        });
    }                                                                                              
});

type RenderParameters = {
    searchResponse: (options: {
        randomSeed: string | null;
        startIndex: string | null;
    }) => typeof mockQuestionFinderResults;
};
