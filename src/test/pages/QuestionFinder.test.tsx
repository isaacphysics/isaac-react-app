import {act, screen, waitFor, within} from "@testing-library/react";
import { clickOn, enterInput, expectUrlParams, renderTestEnvironment, setUrl, withMockedRandom} from "../testUtils";
import { buildMockQuestionFinderResults, buildMockQuestions, mockQuestionFinderResults } from "../../mocks/data";
import _ from "lodash";
import { buildFunctionHandler } from "../../mocks/handlers";
import { isPhy, siteSpecific } from "../../app/services";
import userEvent from "@testing-library/user-event";

describe("QuestionFinder", () => {
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
    });
});

type RenderParameters = {
    questionsSearchResponse: (options: {
        randomSeed: string | null;
        startIndex: string | null;
    }) => typeof mockQuestionFinderResults;
    queryParams?: string;
};

const mainContainer = () => screen.findByTestId('main');

const findQuestions = () => screen.findByTestId("question-finder-results").then(e => within(e).findAllByRole('listitem'));

const getQuestionText = (q: HTMLElement) => q.querySelector(isPhy ? 'span' : 'span.question-link-title')?.textContent;

const expectQuestions = (expectedQuestions: typeof mockQuestionFinderResults.results) => waitFor(async () => {
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