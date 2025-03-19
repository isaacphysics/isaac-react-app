import {screen} from "@testing-library/react";
import { clickButton, renderTestEnvironment, waitForLoaded, withMockedRandom} from "../testUtils";
import { mockQuestionFinderResults } from "../../mocks/data";
import { http, HttpResponse } from "msw";
import { API_PATH, isAda } from "../../app/services";
import { UserRole } from "../../IsaacApiTypes";

describe("SubjectLandingPage", () => {
    if (isAda) {
        it('does not matter', () => {});
    } else {
        const expectInDocument = (text: string) => screen.findByText(text).then(e => expect(e).toBeInTheDocument());
        const questions = mockQuestionFinderResults.results;
        const renderSubjectLandingPage = async (role: UserRole | "ANONYMOUS" ) => {
            const result = { requestCount: 0 };
          
            renderTestEnvironment({
                role,
                extraEndpoints: [
                    http.get(API_PATH + "/pages/questions/", async ({request}) => {
                        result.requestCount++;
                        const length = mockQuestionFinderResults.results.length;
                        const randomSeed = parseInt(new URL(request.url).searchParams.get('randomSeed') || '0') % length;
                        return HttpResponse.json({
                            ...mockQuestionFinderResults,
                            results: mockQuestionFinderResults.results.slice(randomSeed, length)
                        }, {
                            status: 200,
                        });
                    })
                ]
            });
    
            await clickButton("GCSE Maths");
            return result;
        };

        it('should show the first question', () => 
            withMockedRandom(async (randomSequence) => {
                randomSequence([0]);
                await renderSubjectLandingPage('ANONYMOUS');

                await waitForLoaded();
            
                await expectInDocument(questions[0].title);
            })
        );

        it('should send exactly 1 request', async () => {
            const page = await renderSubjectLandingPage('ANONYMOUS');
        
            await waitForLoaded();

            expect(page.requestCount).toEqual(1);
        });

        describe('when a new question is requested', () => {
            it('should show the second question and send exactly 2 requests', () => 
                withMockedRandom(async (randomSequence) => {
                    randomSequence([0, 1 * 10 ** -6]);
                    
                    const page = await renderSubjectLandingPage('ANONYMOUS');
                    await waitForLoaded();
                    await expectInDocument(questions[0].title);
    
                    await clickButton("Get a different question");
                    await waitForLoaded();
                    await expectInDocument(questions[1].title);
                    expect(page.requestCount).toEqual(2);
                })
            );
        });
    }
});
