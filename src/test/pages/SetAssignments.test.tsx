import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SetAssignments} from "../../app/components/pages/SetAssignments";
import {mockActiveGroups, mockGameboards, mockSetAssignments} from "../../mocks/data";
import {dayMonthYearStringToDate, DDMMYYYY_REGEX, ONE_DAY_IN_MS, SOME_FIXED_FUTURE_DATE} from "../dateUtils";
import {clickButton, renderTestEnvironment, withMockedDate} from "../testUtils";

import {API_PATH, isAda, isPhy, PATHS, siteSpecific} from "../../app/services";
import { http, HttpHandler, HttpResponse } from "msw";
import { AssignmentDTO } from "../../IsaacApiTypes";
import { buildPostHandler } from "../../mocks/handlers";

const expectedPhysicsTopLinks = {
    "our books": null,
    "our Boards by Topic": "/pages/pre_made_gameboards",
    "create a gameboard": PATHS.GAMEBOARD_BUILDER
};

describe("SetAssignments", () => {

    const renderSetAssignments = ({path = PATHS.SET_ASSIGNMENTS, endpoints = []}: { endpoints?: HttpHandler[], path?: string } = {}) => {
        renderTestEnvironment({
            PageComponent: SetAssignments,
            initalRouteEntries: [path],
            extraEndpoints: endpoints
        });
    };

    it('should show 6 gameboards in card view (and start in this view on Phy)', async () => {
        renderSetAssignments();
        if (isPhy) {
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
            expect(viewDropdown.value).toEqual("Card View");
        } else {
            // Change view to "Card View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
        }
        expect(await screen.findAllByTestId("gameboard-card")).toHaveLength(6);
    });

    it('should show all gameboards in table view (and start in this view on CS)', async () => {
        renderSetAssignments();
        if (isAda) {
            await waitFor(() => {
                expect(screen.queryAllByText("Loading...")).toHaveLength(0);
            });
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
            expect(viewDropdown.value).toEqual("Table View");
        } else {
            // Change view to "Table View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Table View");
        }
        // Make sure that all gameboards are listed
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
    });

    isPhy && it('should have links to gameboards/relevant info to setting assignments at the top of the page (Phy only)', async () => {
        renderSetAssignments();
        for (const [title, href] of Object.entries(expectedPhysicsTopLinks)) {
            const button = await screen.findByRole("link", {name: title});
            expect(button.getAttribute("href")).toBe(href);
        }
    });

    it('should show all the correct information for a gameboard in card view', async () => {
        renderSetAssignments();
        if (!isPhy) {
            // Change view to "Card View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
        const gameboards = await screen.findAllByTestId("gameboard-card");

        const gameboard = gameboards[0];
        const mockGameboard = mockGameboards.results[0];

        // Check that group count is correct
        const assignmentsToGameboard = mockSetAssignments.filter(a => a.gameboardId === mockGameboard.id);
        const groupsAssignedHexagon = await within(gameboard).findByTitle("Number of groups assigned");
        expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual(`${assignmentsToGameboard.length}group${assignmentsToGameboard.length === 1 ? "" : "s"}`);

        // Check that created date is present and in the expected format
        const dateText = within(gameboard).getByTestId("created-date").textContent?.replace(/Created:\s?/, "");
        expect(dateText).toMatch(DDMMYYYY_REGEX);
        expect(mockGameboard.creationDate - (dayMonthYearStringToDate(dateText)?.valueOf() ?? 0)).toBeLessThanOrEqual(ONE_DAY_IN_MS);

        // TODO fix stage and difficulty tests (broken since UI change Jan 2023)
        // Check that stages are displayed
        // const requiredStages = (mockGameboard.contents as {audience?: {stage?: STAGE[]}[]}[]).reduce(
        //     (set: Set<string>, q) => q.audience?.reduce(
        //         (_set: Set<string>, a) => a.stage?.reduce(
        //             (__set: Set<string>, t) => __set.add(stageLabelMap[t]),
        //             _set) ?? _set,
        //         set) ?? set,
        //     new Set<string>());
        // const stages = within(gameboard).getByText("Stages:").textContent?.replace(/Stages:\s?/, "")?.split(/,\s?/);
        //
        // if (!stages || stages.length === 0) {
        //     expect(requiredStages.size).toBe(0);
        // } else {
        //     requiredStages.forEach(s => {
        //         expect(stages?.includes(s)).toBeTruthy();
        //     });
        //     stages.forEach(s => {
        //         expect(requiredStages?.has(s)).toBeTruthy();
        //     });
        // }
        //
        // // Check for difficulty title TODO check for SVG using something like screen.getByTitle("Practice 2 (P2)...")
        // within(gameboard).getByText("Difficulty:");

        // Ensure we have a title with a link to the gameboard
        const title = within(gameboard).getByRole("link", {name: mockGameboard.title});
        expect(title.getAttribute("href")).toBe(`/assignment/${mockGameboard.id}`);

        // Ensure the assign/unassign button exists
        within(gameboard).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
    });

    it('should let you assign a gameboard in card view (using the modal)', async () => {
        const requestGroupIds = (body: AssignmentDTO[]) => body?.map((x) => x.groupId!);
        const requestAssignment = (body: AssignmentDTO[]) => body[0];
        const observer = parameterObserver<AssignmentDTO[]>();

        renderSetAssignments({
            endpoints: [
                buildPostHandler(
                    "/assignments/assign_bulk",
                    observer.attach(body => body.map(x => ({ groupId: x.groupId, assignmentId: x.groupId! * 2 })))
                ), 
            ]
        });
        if (!isPhy) {
            // Change view to "Card View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
        const gameboards = await screen.findAllByTestId("gameboard-card");
        const mockGameboard = mockGameboards.results[0];

        // Find and click assign gameboard button for the first gameboard
        const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
        await userEvent.click(modalOpenButton);

        // Wait for modal to appear, for the gameboard we expect
        const modal = await screen.findByTestId("set-assignment-modal");
        expect(modal).toHaveModalTitle(mockGameboard.title);
        // Ensure all active groups are selectable in the drop-down
        const groupSelector = await toggleGroupSelect();
        mockActiveGroups.forEach(g => {
            expect(groupSelector.textContent).toContain(g.groupName);
        });
        // Pick the second active group
        await selectGroup(mockActiveGroups[1].groupName);

        // Check scheduled start date and due date are there
        within(modal).getByLabelText("Schedule an assignment start date", {exact: false});
        const dueDateContainer = within(modal).getByLabelText("Due date reminder", {exact: false});
        // TODO check setting scheduled start date and due date leads to correctly saved values,
        //  since this currently just checks any form of due date is set.
        await userEvent.selectOptions(dueDateContainer, "1");

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
        await clickButton('Assign to group', Promise.resolve(modal));

        // Expect request to be sent off with expected parameters
        await waitFor(() => {
            expect(requestGroupIds(observer.observedParams!)).toEqual([mockActiveGroups[1].id]);
            expect(requestAssignment(observer.observedParams!).gameboardId).toEqual(mockGameboard.id);
            expect(requestAssignment(observer.observedParams!).notes).toEqual(testNotes);
            expect(requestAssignment(observer.observedParams!).dueDate).toBeDefined();
            expect(requestAssignment(observer.observedParams!).scheduledStartDate).not.toBeDefined();
        });

        // Check that new assignment is displayed in the modal
        await waitFor(() => {
            const newCurrentAssignments = within(modal).queryAllByTestId("current-assignment");
            expect(newCurrentAssignments.map(a => a.textContent).join(",")).toContain(mockActiveGroups[1].groupName);
        });

        // Close modal
        const closeButtons = within(modal).getAllByRole("button", {name: "Close"});
        expect(closeButtons).toHaveLength(siteSpecific(2, 1)); // One at the top (and one at the bottom on Phy)
        await userEvent.click(closeButtons[0]);
        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });

        // Make sure the gameboard number of groups assigned is updated
        const groupsAssignedHexagon = await within(gameboards[0]).findByTitle("Number of groups assigned");
        expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual("2groups");
    });

    describe('modal', () => {
        const mockGameboard = mockGameboards.results[0];
        const renderModal = (endpoints: HttpHandler[] = []) => renderSetAssignments({ path: `${PATHS.SET_ASSIGNMENTS}#${mockGameboard.id}`, endpoints}); 

        it('groups are empty', async () => {
            renderModal();
            const select = await within(await modal()).findByTestId('modal-groups-selector');
            expect(select).toHaveTextContent('Group(s):None');
        });
    
        it('start date is empty', async () => {
            renderModal();
            expect(await dateInput(/Schedule an assignment start date/)).toHaveValue('');
        });
            
        it('due date is a week from now', async() => {
            await withMockedDate(Date.parse("2025-01-30"), async () => { // Monday
                renderModal();
                expect(await dateInput("Due date reminder")).toHaveValue('2025-02-05'); // Sunday
            });
        });

        it('due date is displayed in UTC', async () => {
            await withMockedDate(Date.parse("2025-04-28T23:30:00.000Z"), async () => { // Monday in UTC, already Tuesday in UTC+1.
                renderModal();
                expect(await dateInput("Due date reminder")).toHaveValue('2025-05-04'); // Sunday in UTC (would be Monday if we showed UTC+1)
            });
        });

        const testPostedDueDate = ({ currentTime, expectedDueDatePosted } : { currentTime: string, expectedDueDatePosted: string}) => async () => {
            await withMockedDate(Date.parse(currentTime), async () => { // Monday
                const observer = parameterObserver<AssignmentDTO[]>();
                renderModal([
                    buildPostHandler(
                        "/assignments/assign_bulk",
                        observer.attach(body => body.map(x => ({ groupId: x.groupId, assignmentId: x.groupId! * 2 })))
                    )
                ]);

                await toggleGroupSelect();
                await selectGroup(mockActiveGroups[1].groupName);
                await clickButton('Assign to group', modal());

                await waitFor(() => expect(observer.observedParams![0].dueDate).toEqual(expectedDueDatePosted)); // Sunday
            });
        };

        it('posts the default due date as UTC midnight, even when that is not exactly 24 hours away', testPostedDueDate(
            { currentTime: "2025-01-30T09:00:00.000Z" /* Monday */, expectedDueDatePosted: "2025-02-05T00:00:00.000Z" /* Sunday */ }
        ));

        it('posts the default due date as UTC midnight, even when local representation does not equal UTC', testPostedDueDate(
            { currentTime: "2025-04-28" /* Monday */, expectedDueDatePosted: "2025-05-04T00:00:00.000Z" /* Sunday */ }
        ));
    });

    it('should let you unassign a gameboard', async () => {
        // Arrange
        renderTestEnvironment({
            PageComponent: SetAssignments,
            initalRouteEntries: [PATHS.MY_ASSIGNMENTS],
            extraEndpoints: [
                http.delete(API_PATH + "/assignments/assign/test-gameboard-1/2", async () => {
                    return HttpResponse.json(null, {
                        status: 204,
                    });
                })
            ]
        });
        if (!isPhy) {
            // Change view to "Card View"
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
        const gameboards = await screen.findAllByTestId("gameboard-card");

        // Find and click assign gameboard button
        const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
        await userEvent.click(modalOpenButton);

        // Wait for modal to appear
        const modal = await screen.findByTestId("set-assignment-modal");

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
            renderTestEnvironment({
                PageComponent: SetAssignments,
                initalRouteEntries: [PATHS.MY_ASSIGNMENTS],
                extraEndpoints: [
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
            if (!isPhy) {
            // change view to "Card View"
                const viewDropdown = await screen.findByLabelText("Display in");
                await userEvent.selectOptions(viewDropdown, "Card View");
            }
            const gameboards = await screen.findAllByTestId("gameboard-card");

            // find and click assign gameboard button for the first gameboard
            const modalOpenButton = within(gameboards[0]).getByRole("button", {name: /Assign\s?\/\s?Unassign/});
            await userEvent.click(modalOpenButton);

            // wait for modal to appear, for the gameboard we expect
            const modal = await screen.findByTestId("set-assignment-modal");

            // select the group with that gameboard already assigned
            const selectContainer = within(modal).getByText(/Group(\(s\))?:/);
            const selectBox = within(modal).getByLabelText(/Group(\(s\))?:/);
            await userEvent.click(selectBox);
            const group1Choice = within(selectContainer).getByText(mockActiveGroups[0].groupName);
            await userEvent.click(group1Choice);

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
            const closeButtons = within(modal).getAllByRole("button", {name: "Close"});
            await userEvent.click(closeButtons[0]);
            await waitFor(() => {
                expect(modal).not.toBeInTheDocument();
            });

            const groupsAssignedHexagon = await within(gameboards[0]).findByTitle("Number of groups assigned");
            expect(groupsAssignedHexagon.textContent?.replace(" ", "")).toEqual("1group");
        });
    });
});

const modal = () => screen.findByTestId("set-assignment-modal");

const dateInput = async (labelText: string | RegExp) => {
    const label = await within(await modal()).findByText(labelText);
    return await within(label).findByTestId('date-input');
};

const toggleGroupSelect = async () => {
    const selectBox = within(await modal()).getByLabelText(/Group(\(s\))?:/);
    await userEvent.click(selectBox);
    return within(await modal()).getByText(/Group(\(s\))?:/);;
};

const selectGroup = async (groupName: string) => {
    const selectContainer = within(await modal()).getByText(/Group(\(s\))?:/);
    const group1Choice = within(selectContainer).getByText(groupName);
    await userEvent.click(group1Choice);
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
