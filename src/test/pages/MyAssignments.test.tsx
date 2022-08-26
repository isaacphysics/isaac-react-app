import React from "react";
import {rest} from "msw";
import {API_PATH} from "../../app/services";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MyAssignments} from "../../app/components/pages/MyAssignments";
import {mockMyAssignments} from "../../mocks/data";
import {augmentErrorMessage, renderTestEnvironment} from "./utils";
import produce from "immer";

describe("MyAssignments", () => {

    const renderMyAssignments = () => {
        renderTestEnvironment({
            PageComponent: MyAssignments,
            initalRouteEntries: ["/assignments"]
        });
    };

    it('should show my current assignments on render', async () => {
        renderMyAssignments();
        const assignments = await screen.findAllByTestId("my-assignment");
        expect(assignments).toHaveLength(mockMyAssignments.length);
    });

    it('should render with "To Do" tab open first', async () => {
        renderMyAssignments();
        const toDoTab = await screen.findByTitle("Assignments To Do tab");
        const olderTab = await screen.findByTitle("Older Assignments tab");
        const completedTab = await screen.findByTitle("Completed Assignments tab");
        expect(toDoTab.classList).toContain("active");
        expect(olderTab.classList).not.toContain("active");
        expect(completedTab.classList).not.toContain("active");
    });

    it('should allow users to filter assignments on gameboard title', async () => {
        renderMyAssignments();
        const filter = await screen.findByPlaceholderText("Filter assignments by name");
        await userEvent.type(filter, "Test Gameboard 3");
        // Only one assignment should be shown
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(1);
        // Cleanup filter
        await userEvent.clear(filter);
        // Expect to see all assignments again
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(mockMyAssignments.length);
    });

    it('should open "Older" tab when tab is clicked, and tab should contain no assignments', async () => {
        renderMyAssignments();
        const toDoTab = await screen.findByTitle("Assignments To Do tab");
        const olderTab = await screen.findByTitle("Older Assignments tab");
        const completedTab = await screen.findByTitle("Completed Assignments tab");
        await userEvent.click(olderTab);
        await waitFor(() => {
            expect(toDoTab.classList).not.toContain("active");
            expect(olderTab.classList).toContain("active");
            expect(completedTab.classList).not.toContain("active");
        }, {onTimeout: augmentErrorMessage("Tabs did not change to the correct state fast enough")});
        expect(screen.queryAllByTestId("my-assignment")).toHaveLength(0);
    });

    it('should contain assignments with undefined due date and older than a month in the "Older Assignments" tab', async () => {
        renderTestEnvironment({
            PageComponent: MyAssignments,
            initalRouteEntries: ["/assignments"],
            extraEndpoints: [
                rest.get(API_PATH + "/assignments", (req, res, ctx) => {
                    let d = new Date();
                    d.setUTCDate(d.getUTCDate() - 1);
                    d.setUTCMonth(d.getUTCMonth() - 1);
                    const assignmentsWithOneOld = produce<any[]>(mockMyAssignments, as => {
                        as[0].creationDate = d.valueOf();
                        as[0].scheduledStartDate = d.valueOf();
                        delete as[0].dueDate;
                    });
                    return res(
                        ctx.status(200),
                        ctx.json(assignmentsWithOneOld)
                    );
                })
            ]
        });
        // Wait for the 3 "To Do" assignments to show up
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(3);
        // Click across to the "Older Assignments" tab
        const olderTab = await screen.getByTitle("Older Assignments tab");
        await userEvent.click(olderTab);
        // Wait for the one old assignment that we expect
        expect(await screen.findAllByTestId("my-assignment")).toHaveLength(1);
    });
});
