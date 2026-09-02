import { http, HttpHandler, HttpResponse } from "msw";
import { API_PATH, isAda, PATHS, siteSpecific } from "../../app/services";
import { navigateToSetManageWork, renderTestEnvironment, waitForLoaded } from "../testUtils";
import { screen, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { dayMonthYearStringToDate, DAYS_AGO, DDMMYYYY_REGEX, NOW, SOME_FIXED_FUTURE_DATE, TEXTUAL_DATE_REGEX } from "../dateUtils";
import { mockUser } from "../../mocks/data";

const ASSIGNED_TEXT_PREFIX = siteSpecific("Assigned on ", "Assigned: ");
const DATE_REGEX = siteSpecific(TEXTUAL_DATE_REGEX, DDMMYYYY_REGEX);
const FIRST_ASSIGNMENT_ID = 37;
const SECOND_ASSIGNMENT_ID = 38;

describe("Set / Manage work", () => {
    if (isAda) {
        it('is hidden on Ada', () => {});
        return;
    }

    const renderSetManageWork = async ({endpoints, useSecond}: { endpoints?: HttpHandler[], useSecond?: boolean } = {}) => {
        await renderTestEnvironment({
            extraEndpoints: [
                http.get(API_PATH + "/assignments/assign", () => {
                    return HttpResponse.json(
                        [
                            (!useSecond ? {
                                id: FIRST_ASSIGNMENT_ID,
                                gameboardId: "test-gameboard",
                                gameboard: {
                                    id: "test-gameboard",
                                    title: "Test Gameboard",
                                    creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                                    ownerUserId: 1,
                                    tags: [
                                        "ISAAC_BOARD"
                                    ],
                                    creationMethod: "BUILDER"
                                },
                                groupId: 2,
                                groupName: "Test Group 1",
                                ownerUserId: mockUser.id,
                                creationDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), 3),
                                dueDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -5, true),
                                scheduledStartDate: DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1, true),
                            } : {
                                id: SECOND_ASSIGNMENT_ID,
                                gameboardId: "test-gameboard-2",
                                gameboard: {
                                    id: "test-gameboard-2",
                                    title: "Test Gameboard 2",
                                    creationDate: DAYS_AGO(new Date(NOW), 2, true),
                                    ownerUserId: 1,
                                    tags: [
                                        "ISAAC_BOARD"
                                    ],
                                    creationMethod: "BUILDER"
                                },
                                groupId: 2,
                                groupName: "Test Group 1",
                                ownerUserId: mockUser.id,
                                creationDate: DAYS_AGO(new Date(NOW), 1, true),
                                dueDate: DAYS_AGO(new Date(NOW), -5, true),
                                scheduledStartDate: DAYS_AGO(new Date(NOW), 1, true),
                            })
                        ],
                        {
                            status: 200,
                        }
                    );
                }),
                ...(endpoints ?? []),
            ]
        });
        await navigateToSetManageWork();
        await waitForLoaded();
    };

    it("should show assignments by month", async () => {
        await renderSetManageWork();
        
        // this should match SOME_FIXED_FUTURE_DATE_AS_STRING's year/month/day (currently 2050/01/16)
        expect(await screen.findByTestId("timeline")).toContainHTML("2050");
        await userEvent.click(screen.getByText("January"));
        await userEvent.click(screen.getByText("Sun ⋅ 1 group ⋅ 1 assignment set"));
        const boardCards = await screen.findAllByTestId("gameboard-card");
        expect(boardCards).toHaveLength(1);
    });

    describe("gameboard cards", () => {
        it('should show the group the assignment has been set to', async () => {
            await renderSetManageWork();

            const timeline = await screen.findByTestId("timeline");
            await userEvent.click(within(timeline).getByTestId("month-label"));
            await userEvent.click(within(timeline).getByTestId("day-label"));
            const boardCards = await screen.findAllByTestId("gameboard-card");
            expect(boardCards).toHaveLength(1);

            const assignment = boardCards[0];
            const assignedDateEl = within(assignment).getByTestId("gameboard-assigned-group");
            const assignedDateText = assignedDateEl?.textContent?.replace("Set to ", "");
            expect(assignedDateText).toBe("Test Group 1");
        });

        it('should show the scheduled start date as the "Assigned" date if it exists', async () => {
            await renderSetManageWork();

            const timeline = await screen.findByTestId("timeline");
            await userEvent.click(within(timeline).getByTestId("month-label"));
            await userEvent.click(within(timeline).getByTestId("day-label"));
            const boardCards = await screen.findAllByTestId("gameboard-card");
            expect(boardCards).toHaveLength(1);

            const assignment = boardCards[0];
            const assignedDateEl = within(assignment).getByTestId("gameboard-assigned-date");
            const assignedDateText = assignedDateEl?.textContent?.replace(ASSIGNED_TEXT_PREFIX, "");
            expect(assignedDateText).toMatch(DATE_REGEX);
            const assignedDate = siteSpecific(Date.parse(assignedDateText!), dayMonthYearStringToDate(assignedDateText));
            expect(assignedDate?.valueOf()).toEqual(DAYS_AGO(new Date(SOME_FIXED_FUTURE_DATE), -1, true));
        });

        it('should link to the assignment progress page for that assignment in the card usage info, if started', async () => {
            await renderSetManageWork({useSecond: true});

            const timeline = await screen.findByTestId("timeline");
            // await userEvent.click(within(timeline).getByTestId("month-label"));
            // this month is open by default (?), so don't need above
            await userEvent.click(within(timeline).getByTestId("day-label"));
            const boardCards = await screen.findAllByTestId("gameboard-card");
            expect(boardCards).toHaveLength(1);

            const assignment = boardCards[0];
            const usageInfo = within(assignment).getByTestId("card-usage-info");
            const link = within(usageInfo).getByRole("link", {name: "View group progress (opens in new tab)"});
            expect(link.getAttribute("href")).toBe(PATHS.ASSIGNMENT_PROGRESS + `/${SECOND_ASSIGNMENT_ID}`);
        });

        it('should display the start date in the card usage info, if not started', async () => {
            await renderSetManageWork();

            const timeline = await screen.findByTestId("timeline");
            await userEvent.click(within(timeline).getByTestId("month-label"));
            await userEvent.click(within(timeline).getByTestId("day-label"));
            const boardCards = await screen.findAllByTestId("gameboard-card");
            expect(boardCards).toHaveLength(1);

            const assignment = boardCards[0];
            const usageInfo = within(assignment).getByTestId("card-usage-info");
            expect(usageInfo).toHaveTextContent("Begins on Sun, 16 Jan 2050");
        });
    });
});
