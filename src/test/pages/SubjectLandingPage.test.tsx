import {screen, waitFor} from "@testing-library/react";
import { renderTestEnvironment} from "../testUtils";
import { mockQuestionFinderResults } from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { API_PATH } from "../../app/services";
import { act } from "react";


jest.setTimeout(15000);
describe("SubjectLandingPage", () => {
    let requestCount = 0;

    const renderSubjectLandingPage = async () => {
        await act(()=> {
            renderTestEnvironment({
                extraEndpoints: [
                    http.get(API_PATH + "/pages/questions/", async () => {
                        console.log('got request')
                        await new Promise((resolve) => setTimeout(resolve, 3000))
                        requestCount += 1;
                        console.log('returning request');
                        return HttpResponse.json(mockQuestionFinderResults, {
                            status: 200,
                        });
                    })
                ]
            });
        });
    
        const links = await screen.findAllByText("GCSE Maths")
        await act((() => userEvent.click(links[0])));
    };

    it('should show the first question', async () => {
        const expectedQuestion = mockQuestionFinderResults.results[0];
        await renderSubjectLandingPage();
        
        await waitFor(() => {
            expect(screen.queryAllByText("Loading...")).toHaveLength(0);
        }, { timeout: 5000});

        expect(await screen.findByText(expectedQuestion.title)).toBeInTheDocument();
        jest.advanceTimersByTime(1000)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        jest.advanceTimersByTime(1000)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        expect(requestCount).toEqual(1);
    });
});
