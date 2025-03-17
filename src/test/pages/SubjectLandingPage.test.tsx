import {screen, waitFor} from "@testing-library/react";
import { renderTestEnvironment} from "../testUtils";
import { mockQuestionFinderResults } from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { API_PATH, isAda } from "../../app/services";
import { UserRole } from "../../IsaacApiTypes";
import * as SubjectLandingPage from "../../app/components/pages/SubjectLandingPage";

describe("SubjectLandingPage", () => {
    if (isAda) {
        it('does not matter', () => {});
    } else {
        beforeEach(() => {
            jest.spyOn(SubjectLandingPage, 'nextRandom').mockImplementation(() => nextRandom.get()); 
        });

        afterEach(() => {
            jest.spyOn(SubjectLandingPage, 'nextRandom').mockRestore();
        });

        const waitForLoaded = () => waitFor(() => {
            expect(screen.queryAllByText("Loading...")).toHaveLength(0);
        });

        const clickButton = (text: string) => screen.findAllByText(text).then(e => userEvent.click(e[0]));

        const nextRandom = {
            value: -1,
            get() { return this.value; },
            set(n: number) { this.value = n * 10 ** -6; }
        };

        const renderSubjectLandingPage = async (role: UserRole | "ANONYMOUS" ) => {
            const result = { requestCount: 0 };
          
            renderTestEnvironment({
                role,
                extraEndpoints: [
                    http.get(API_PATH + "/pages/questions/", async ({request}) => {
                        result.requestCount++;
                        const length = mockQuestionFinderResults.results.length;
                        const randomSeed = parseInt(new URL(request.url).searchParams.get('randomSeed') || '0');
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

        it('should show the first question', async () => {
            nextRandom.set(0);
            await renderSubjectLandingPage('ANONYMOUS');

            await waitForLoaded();
        
            const expectedQuestion = mockQuestionFinderResults.results[0];
            expect(await screen.findByText(expectedQuestion.title)).toBeInTheDocument();
        });

        it('should send exactly 1 request', async () => {
            nextRandom.set(0);
            const result = await renderSubjectLandingPage('ANONYMOUS');
        
            await waitForLoaded();

            expect(result.requestCount).toEqual(1);
        });

        describe('when a new question is requested', () => {
            it('shows the second question', async () => {
                nextRandom.set(0);
                await renderSubjectLandingPage('ANONYMOUS');
        
                await waitForLoaded();

                const firstQuestion = mockQuestionFinderResults.results[0];
                expect(await screen.findByText(firstQuestion.title)).toBeInTheDocument();

                nextRandom.set(1);
                await clickButton("Get a different question");
                await waitForLoaded();
                
                const secondQuestion = mockQuestionFinderResults.results[1];
                expect(await screen.findByText(secondQuestion.title)).toBeInTheDocument();
            });
        });
    }
});
