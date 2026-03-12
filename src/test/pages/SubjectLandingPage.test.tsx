import { screen } from "@testing-library/react";
import { clickOn, renderTestEnvironment, setUrl, waitForLoaded, withMockedRandom} from "../testUtils";
import { mockQuestionFinderResults } from "../../mocks/data";
import { isAda } from "../../app/services";
import { buildFunctionHandler } from "../../mocks/handlers";

describe("SubjectLandingPage", () => {
    if (isAda) {
        it('does not matter', () => {});
    } else {
        const questions = mockQuestionFinderResults.results;

        const renderSubjectLandingPage = async ({questionsSearchResponse} : RenderParameters) => {
            await renderTestEnvironment({
                role: 'ANONYMOUS',
                extraEndpoints: [buildFunctionHandler('/pages/questions', ['randomSeed'], questionsSearchResponse)]
            });
            await waitForLoaded();
            await setUrl({ pathname: '/maths/gcse' });
            await waitForLoaded();
        };

        it('should show the first question', () => 
            withMockedRandom(async (randomSequence) => {
                randomSequence([0]);
                await renderSubjectLandingPage({ questionsSearchResponse: () => mockQuestionFinderResults});

                await waitForLoaded();
            
                await expectInDocument(questions[0].title);
            })
        );

        it('should send exactly 1 request', async () => {
            const requestCounter = buildCounter();
            await renderSubjectLandingPage({ questionsSearchResponse: requestCounter.attach(() => mockQuestionFinderResults)});
        
            await waitForLoaded();

            expect(requestCounter.count).toEqual(1);
        });

        describe('when a new question is requested', () => {
            it('should show the second question and send exactly 2 requests', () =>
                withMockedRandom(async (randomSequence) => {
                    randomSequence([0, 1 * 10 ** -6]);
                    const requestCounter = buildCounter();
                    
                    await renderSubjectLandingPage({
                        questionsSearchResponse: requestCounter.attach(({ randomSeed }) => {
                            if (randomSeed !== null) {
                                return {...mockQuestionFinderResults, results: [questions[parseInt(randomSeed)]]};
                            }
                            throw new Error('Expected random seed.');
                        })
                    });
                    await waitForLoaded();
                    await expectInDocument(questions[0].title);
    
                    await clickOn("Get a different question");
                    await waitForLoaded();
                    await expectInDocument(questions[1].title);
                    expect(requestCounter.count).toEqual(2);
                })
            );
        });
    }
});

type RenderParameters = {
    questionsSearchResponse: (options: {
        randomSeed: string | null;
    }) => typeof mockQuestionFinderResults;
};

const buildCounter = () => ({
    count: 0,
    attach<T, U>(fn: ((p: T) => U)) {
        return (p: T) => {
            this.count++;
            return fn(p);
        };
    } 
});

const expectInDocument = (text: string) => screen.findByText(text).then(e => expect(e).toBeInTheDocument());
