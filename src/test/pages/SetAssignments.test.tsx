import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {mockActiveGroups, mockGameboards, mockSetAssignments} from "../../mocks/data";
import {
    dayMonthYearStringToDate,
    DDMMYYYY_REGEX,
    ONE_DAY_IN_MS,
    SOME_FIXED_FUTURE_DATE,
    TEXTUAL_DATE_REGEX
} from "../dateUtils";
import {clickOn, navigateToSetAssignments, renderTestEnvironment, withMockedDate} from "../testUtils";

import {API_PATH, isAda, isPhy, PATHS, siteSpecific, STAGE, stageLabelMap} from "../../app/services";
import {http, HttpHandler, HttpResponse} from "msw";
import {AssignmentDTO} from "../../IsaacApiTypes";
import {buildPostHandler} from "../../mocks/handlers";

const expectedPhysicsTopLinks = {
    "our books": null,
    "our topic question decks": "/physics/a_level/question_decks",
    "create a question deck": PATHS.GAMEBOARD_BUILDER
};

const switchToCardView = async () => {
    if (isPhy) {
        const viewDropdown = await screen.findByLabelText("Set display mode");
        await userEvent.selectOptions(viewDropdown, "Card View");

        const limitDropdown = await screen.findByLabelText("Set display limit");
        await userEvent.selectOptions(limitDropdown, "6");
    } else {
        const viewDropdown = await screen.findByLabelText("Display in");
        await userEvent.selectOptions(viewDropdown, "Card View");
    }
};

describe("SetAssignments", () => {

    const renderSetAssignments = async ({endpoints = []}: { endpoints?: HttpHandler[], path?: string } = {}) => {
        await renderTestEnvironment({
            extraEndpoints: endpoints
        });
        await navigateToSetAssignments();
    };

    it('should show 6 gameboards in card view (and start in this view on Phy)', async () => {
        await renderSetAssignments();
        if (isPhy) {
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Set display mode");
            expect(viewDropdown.value).toEqual("Card View");
        } else {
            // Change view to "Card View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");

            const limitDropdown = await screen.findByLabelText("Show");
            await userEvent.selectOptions(limitDropdown, "6");
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
        }
        expect(await screen.findAllByTestId("gameboard-card")).toHaveLength(6);
    });

    it('should show all gameboards in table view (and start in this view on CS)', async () => {
        await renderSetAssignments();
        if (isAda) {
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
            expect(viewDropdown.value).toEqual("Table View");
        } else {
            // Change view to "Table View"
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Table View");
        }
        // Make sure that all gameboards are listed
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);

        const gameboard = gameboardRows[0];
        const mockGameboard = mockGameboards.results[0];

        // Check that stages are displayed
        const requiredStages = (mockGameboard.contents as {audience?: {stage?: STAGE[]}[]}[]).reduce(
            (set: Set<string>, q) => q.audience?.reduce(
                (_set: Set<string>, a) => a.stage?.reduce(
                    (__set: Set<string>, t) => __set.add(stageLabelMap[t]),
                    _set) ?? _set,
                set) ?? set,
            new Set<string>());
        const stages = gameboard.children[2].textContent;
        if (!stages || stages.length === 0) {
            expect(requiredStages.size).toBe(0);
        } else {
            requiredStages.forEach(s => {
                expect(stages?.includes(s)).toBeTruthy();
            });
        }
        // TODO Check that the difficulties are listed

        if (isPhy) {
            // Phy persists the change to table view, so switch back to card view for subsequent tests
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Card View");

            const limitDropdown = await screen.findByLabelText("Set display limit");
            await userEvent.selectOptions(limitDropdown, "6");
        }
    });

    if (isPhy) {
        it('should have links to gameboards/relevant info to setting assignments at the top of the page (Phy only)', async () => {
            await renderSetAssignments();
            for (const [title, href] of Object.entries(expectedPhysicsTopLinks)) {
                const button = await screen.findByRole("link", {name: title});
                expect(button.getAttribute("href")).toBe(href);
            }
        });
    }

    it('should show all the correct information for a gameboard in card view', async () => {
        await renderSetAssignments();
        await switchToCardView();
        const gameboards = await screen.findAllByTestId("gameboard-card");

        const gameboard = gameboards[0];
        const mockGameboard = mockGameboards.results[0];

        // Check that group count is correct
        const assignmentsToGameboard = mockSetAssignments.filter(a => a.gameboardId === mockGameboard.id);
        const groupsAssignedHexagon = await within(gameboard).findByTitle("Number of groups assigned");
        expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual(`${isPhy ? "Assignedto" : ""}${assignmentsToGameboard.length}group${assignmentsToGameboard.length === 1 ? "" : "s"}`);

        // Check that created date is present and in the expected format
        const datePrefix = siteSpecific("Created on ", "Created: ");
        const dateText = within(gameboard).getByTestId("created-date").textContent?.replace(datePrefix, "");
        expect(dateText).toMatch(siteSpecific(TEXTUAL_DATE_REGEX, DDMMYYYY_REGEX));
        const date = siteSpecific(Date.parse(dateText!), dayMonthYearStringToDate(dateText));
        expect(mockGameboard.creationDate - (date?.valueOf() ?? 0)).toBeLessThanOrEqual(ONE_DAY_IN_MS);

        // Ensure gameboard has correct title and link
        if (isAda) {
            const title = within(gameboard).getByRole("link", {name: mockGameboard.title});
            expect(title.getAttribute("href")).toBe(`/assignment/${mockGameboard.id}`);
        }
        if (isPhy) {
            expect(gameboard.getAttribute("href")).toBe(`/assignment/${mockGameboard.id}`);
        }

        // Ensure the assign/unassign button exists
        within(gameboard).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
    });

    it('should let you assign a gameboard in card view (using the modal)', async () => {
        const requestGroupIds = (body: AssignmentDTO[]) => body?.map((x) => x.groupId!);
        const requestAssignment = (body: AssignmentDTO[]) => body[0];
        const observer = parameterObserver<AssignmentDTO[]>();

        await renderSetAssignments({
            endpoints: [
                buildPostHandler(
                    "/assignments/assign_bulk",
                    observer.attach(body => body.map(x => ({ groupId: x.groupId, assignmentId: x.groupId! * 2 })))
                ),
            ]
        });
        await switchToCardView();
        const gameboards = await screen.findAllByTestId("gameboard-card");
        const mockGameboard = mockGameboards.results[0];

        // Find and click assign gameboard button for the first gameboard
        const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
        await userEvent.click(modalOpenButton);

        // Wait for modal to appear, for the gameboard we expect
        const modal = await screen.findByTestId("active-modal");
        expect(modal).toHaveModalTitle(`Assign "${mockGameboard.title}"`);
        // Ensure all active groups are selectable in the drop-down
        await selectGroup(mockActiveGroups[1].groupName);

        // Check scheduled start date and due date are there
        within(modal).getByLabelText("Start date:", {exact: false});
        // TODO check setting scheduled start date and due date leads to correctly saved values,
        // since this currently just checks any form of due date is set.
        const dueDateContainer = within(modal).getByTestId("modal-due-date-selector");
        const dueDateSelector = within(dueDateContainer.children[1] as HTMLElement).getByRole("combobox", {name: "Day"});
        await userEvent.click(within(dueDateContainer).getByRole("button"));
        await userEvent.selectOptions(dueDateSelector, "1"); // set some due date

        // Add some notes
        const testNotes = "Test notes to test groups for test assignments";
        const notesBox = within(modal).getByLabelText("Notes", {exact: false});
        await userEvent.type(notesBox, testNotes);

        // Assert that only first group is currently assigned to this board
        const currentAssignments = within(modal).queryAllByTestId("current-assignment");
        const pendingAssignments = within(modal).queryAllByTestId("pending-assignment");
        const allAssignments = currentAssignments.concat(pendingAssignments);
        expect(allAssignments).toHaveLength(1);
        expect(allAssignments[0].textContent).toContain(mockActiveGroups[0].groupName);

        // Click button
        await clickOn('Assign to group', Promise.resolve(modal));

        // Expect request to be sent off with expected parameters
        await waitFor(() => {
            expect(requestGroupIds(observer.observedParams!)).toEqual([mockActiveGroups[1].id]);
            expect(requestAssignment(observer.observedParams!).gameboardId).toEqual(mockGameboard.id);
            expect(requestAssignment(observer.observedParams!).notes).toEqual(testNotes);
            expect(requestAssignment(observer.observedParams!).dueDate).toBeDefined();
            expect(requestAssignment(observer.observedParams!).scheduledStartDate).toBeDefined();
        });

        // Close modal
        const closeButtons = within(modal).getAllByRole("button", {name: "Close modal"});
        await userEvent.click(closeButtons[0]);
        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });

        // Make sure the gameboard number of groups assigned is updated
        const groupsAssignedHexagon = await within(gameboards[0]).findByTitle("Number of groups assigned");
        expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual(siteSpecific("Assignedto2groups", "2groups"));
    });

    describe('modal', () => {
        const renderModal = async (endpoints: HttpHandler[] = []) => {
            await renderSetAssignments({endpoints});
            await switchToCardView();
            const gameboards = await screen.findAllByTestId("gameboard-card");
            // Find and click assign gameboard button for the first gameboard
            const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
            await userEvent.click(modalOpenButton);
        };

        it('groups are empty by default', async () => {
            await renderModal();
            expect(within(await modal()).getByTestId("modal-groups-selector")).toHaveTextContent('Groups:None');
        });

        it('start date is today by default', async () => {
            await withMockedDate(Date.parse("2025-01-30"), async () => {
                await renderModal();
                expect(await dateInput("modal-start-date-selector")).toHaveValue("2025-01-30");
            });
        });

        it('due date is a week from now by default', async() => {
            await withMockedDate(Date.parse("2025-01-30"), async () => { // Monday
                await renderModal();
                expect(await dateInput("modal-due-date-selector")).toHaveValue('2025-02-05'); // Sunday
            });
        });

        // local time zone is Europe/London, as set in globalSetup.ts
        it('due date is displayed in UTC', async () => {
            await withMockedDate(Date.parse("2025-04-28T23:30:00.000Z"), async () => { // Monday in UTC, already Tuesday in UTC+1.
                await renderModal();
                expect(await dateInput("modal-due-date-selector")).toHaveValue('2025-05-04'); // Sunday in UTC (would be Monday if we showed UTC+1)
            });
        });

        const testPostedDueDate = ({ currentTime, expectedDueDatePosted } : { currentTime: string, expectedDueDatePosted: string}) => async () => {
            await withMockedDate(Date.parse(currentTime), async () => {
                const observer = parameterObserver<AssignmentDTO[]>();
                await renderModal([
                    buildPostHandler(
                        "/assignments/assign_bulk",
                        observer.attach(body => body.map(x => ({ groupId: x.groupId, assignmentId: x.groupId! * 2 })))
                    )
                ]);

                await selectGroup(mockActiveGroups[1].groupName);
                const modal = await screen.findByTestId("active-modal");

                await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));

                await waitFor(() => expect(observer.observedParams![0].dueDate).toEqual(expectedDueDatePosted));
            });
        };

        it('posts the default due date as UTC midnight, even when that is not exactly 24 hours away', 
            testPostedDueDate({ currentTime: "2025-01-30T09:00:00.000Z" /* Monday */, expectedDueDatePosted: "2025-02-05T00:00:00.000Z" /* Sunday */ })
        );

        // local time zone is Europe/London, as set in globalSetup.ts
        it('posts the default due date as UTC midnight, even when local representation does not equal UTC', 
            testPostedDueDate({ currentTime: "2025-04-28" /* Monday */, expectedDueDatePosted: "2025-05-04T00:00:00.000Z" /* Sunday */ })
        );

        describe('validation', () => {
            it('shows an error message when the due date is missing', async () => {
                await renderModal();
                const modal = await screen.findByTestId("active-modal");
                const dueDateContainer = within(modal).getByTestId("modal-due-date-selector");
                await userEvent.click(within(dueDateContainer).getByRole("button", {name: "Clear date"}));

                await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));
                expect(dueDateContainer).toHaveTextContent(`Due dates are required for assignments`);
            });

            it('does not show an error when the due date is present', async () => {
                await renderModal();
                const modal = await screen.findByTestId("active-modal");
                const dueDateContainer = within(modal).getByTestId("modal-due-date-selector");

                await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));
                expect(dueDateContainer).not.toHaveTextContent(`Due dates are required for assignments`);
            });

            it('shows an error message when the due date is before the start date', async () => {
                const year = new Date().getFullYear();
                const startOfYear = new Date(year, 0, 1).valueOf();
                await withMockedDate(startOfYear, async () => {
                    await renderModal();
                    const modal = await screen.findByTestId("active-modal");
                    const dueDateContainer = within(modal).getByTestId("modal-due-date-selector");

                    // Set a start date in the future
                    await inputDate("modal-start-date-selector", "1", "2", String(year));

                    // Set a due date before the start date
                    await inputDate("modal-due-date-selector", "1", "1", String(year));

                    await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));
                    expect(dueDateContainer.textContent).toContain("Due date must be on or after start date and in the future");
                });
            });

            it('shows an error message when no groups are selected', async () => {
                await renderModal();
                const modal = await screen.findByTestId("active-modal");
                const groupContainer = within(modal).getByTestId("modal-groups-selector");

                await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));
                expect(groupContainer).toHaveTextContent("Groups:None");
                expect(within(groupContainer).getByText("Please select a group")).toBeInTheDocument();
            });

            it('shows an error message when the notes exceed 500 characters', async () => {
                await renderModal();
                const modal = await screen.findByTestId("active-modal");
                const notesContainer = within(modal).getByTestId("modal-notes");
                const notesBox = within(notesContainer).getByLabelText("Notes", {exact: false});

                // Type more than 500 characters
                const longNotes = "a".repeat(501);
                await userEvent.type(notesBox, longNotes);

                await userEvent.click(within(modal).getByRole("button", {name: "Assign to group"}));
                expect(notesContainer.textContent).toContain("You have exceeded the maximum length");
            });
        });
    });

    it('should let you unassign a gameboard', async () => {
        // Arrange
        await renderSetAssignments({
            endpoints: [
                http.delete(API_PATH + "/assignments/assign/test-gameboard-1/2", async () => {
                    return HttpResponse.json(null, {
                        status: 204,
                    });
                })
            ]
        });
        await switchToCardView();
        const gameboards = await screen.findAllByTestId("gameboard-card");

        // Find and click assign gameboard button
        const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
        await userEvent.click(modalOpenButton);

        // Wait for modal to appear
        const modal = await screen.findByTestId("active-modal");

        // prepare response to window.confirm dialog
        const confirmSpy = jest.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(jest.fn(() => true));

        // Act
        // click delete button
        const deleteButton = within(modal).getByRole("button", {name: "Unassign group"});
        await userEvent.click(deleteButton);

        // Assert
        const assignedStatusMessage = await within(modal).findByTestId("currently-assigned-to");
        expect(assignedStatusMessage.textContent).toContain("No groups.");

        // Cleanup
        confirmSpy.mockRestore();
    });

    it('should reject duplicate assignment', async () => {
        await withMockedDate(SOME_FIXED_FUTURE_DATE, async () => {
            await renderSetAssignments({
                endpoints: [
                    http.post(API_PATH + "/assignments/assign_bulk", async () => {
                        return HttpResponse.json([
                            {
                                groupId: 1,
                                errorMessage: "You cannot assign the same work to a group more than once."
                            }
                        ], {
                            status: 200,
                        });
                    })
                ]
            });
            await switchToCardView();
            const gameboards = await screen.findAllByTestId("gameboard-card");

            // find and click assign gameboard button for the first gameboard
            const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
            await userEvent.click(modalOpenButton);

            // wait for modal to appear, for the gameboard we expect
            const modal = await screen.findByTestId("active-modal");

            // select the group with that gameboard already assigned
            await selectGroup(mockActiveGroups[0].groupName);

            // Act
            const assignButton = within(modal).getByRole("button", {name: "Assign to group"});
            await userEvent.click(assignButton);

            // Assert
            // check that existing assignment is still the only assignment shown in the modal
            await waitFor(() => {
                const currentAssignment = within(modal).getByTestId("current-assignment");
                expect(currentAssignment.textContent).toContain(mockActiveGroups[0].groupName);
            });

            // close modal, make sure the gameboard number of groups assigned is unchanged
            const closeButtons = within(modal).getAllByRole("button", {name: "Close modal"});
            await userEvent.click(closeButtons[0]);
            await waitFor(() => {
                expect(modal).not.toBeInTheDocument();
            });

            const groupsAssignedHexagon = await within(gameboards[0]).findByTitle("Number of groups assigned");
            expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual(siteSpecific("Assignedto1group", "1group"));
        });
    });
});

const modal = () => screen.findByTestId("active-modal");

const dateInput = async (testIdText: string | RegExp) => await within(await within(await modal()).findByTestId(testIdText)).findByTestId('date-input');

const selectGroup = async (groupName: string) => {
    const modal = await screen.findByTestId("active-modal");
    const groupContainer = within(modal).getByTestId("modal-groups-selector");
    const groupSelector = within(groupContainer).getByRole("combobox");
    await userEvent.click(groupSelector);

    expect(within(groupContainer).getByText(groupName)).toBeInTheDocument();
    const groupChoice = within(groupContainer).getByText(groupName);
    await userEvent.click(groupChoice);
};

const inputDate = async (testIdText: string | RegExp, day: string, month: string, year: string) => {
    const dueDateContainer = within(await modal()).getByTestId(testIdText);
    await userEvent.click(within(dueDateContainer).getByRole("button"));
    const dueDaySelector = within(dueDateContainer.children[1] as HTMLElement).getByRole("combobox", {name: "Day"});
    await userEvent.selectOptions(dueDaySelector, day);
    const dueMonthSelector = within(dueDateContainer.children[1] as HTMLElement).getByRole("combobox", {name: "Month"});
    await userEvent.selectOptions(dueMonthSelector, month);
    const dueYearSelector = within(dueDateContainer.children[1] as HTMLElement).getByRole("combobox", {name: "Year"});
    await userEvent.selectOptions(dueYearSelector, year);
};

const parameterObserver = <T,>() => ({
    observedParams: null as T | null,
    attach<U>(fn: (p: T)=> U) {
        return (p: T) => {
            this.observedParams = p;
            return fn(p);
        };
    }
});
