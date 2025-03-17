import {screen, waitFor} from "@testing-library/react";
import { renderTestEnvironment} from "../testUtils";
import { mockQuestionFinderResults } from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { API_PATH, isPhy } from "../../app/services";
import { UserRole } from "../../IsaacApiTypes";

jest.setTimeout(10000);

isPhy && describe("SubjectLandingPage", () => {
    const renderSubjectLandingPage = async (role: UserRole | "ANONYMOUS" ) => {
        const result = { requestCount: 0 };
        renderTestEnvironment({
                role,
                extraEndpoints: [
                    http.get(API_PATH + "/pages/questions/", async () => {
                        result.requestCount++;
                        return HttpResponse.json(mockQuestionFinderResults, {
                            status: 200,
                        });
                    })
                ]
            });
    
        const links = await screen.findAllByText("GCSE Maths")
        await userEvent.click(links[0]);
        return result;
    };

    const waitForLoaded = () => waitFor(() => {
        expect(screen.queryAllByText("Loading...")).toHaveLength(0);
    });

    it('should show the first question', async () => {
        await renderSubjectLandingPage('ANONYMOUS');

        await waitForLoaded();
        
        const expectedQuestion = mockQuestionFinderResults.results[0];
        expect(await screen.findByText(expectedQuestion.title)).toBeInTheDocument();
    });

    it('should send exactly 1 request', async () => {
        const result = await renderSubjectLandingPage('ANONYMOUS');
        
        await waitForLoaded();

        expect(result.requestCount).toEqual(1);
    });
});
