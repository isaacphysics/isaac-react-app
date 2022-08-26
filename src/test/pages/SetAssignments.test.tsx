import React from "react";
import {screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SetAssignments} from "../../app/components/pages/SetAssignments";
import {mockGameboards, mockSetAssignments} from "../../mocks/data";
import {dayMonthYearStringToDate, DDMMYYYY_REGEX, ONE_DAY_IN_MS, renderTestEnvironment} from "./utils";
import {siteSpecific, STAGE, stageLabelMap} from "../../app/services";

const expectedTopLinks = siteSpecific(
    {
        "our books": null,
        "our Boards for Lessons": "/pages/pre_made_gameboards",
        "create a gameboard": "/gameboard_builder"
    },
    {
        "Pre-made gameboards": "/pages/gameboards",
        "Topics list": "/topics",
        "Create gameboard": "/gameboard_builder"
    }
);

describe("SetAssignments", () => {

    const renderSetAssignments = () => {
        renderTestEnvironment({
            PageComponent: SetAssignments,
            initalRouteEntries: ["/assignments"]
        });
    };

    it('should start in card view, with 6 gameboards shown', async () => {
        renderSetAssignments();
        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });
        const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
        expect(viewDropdown.value).toEqual("Card View");
        expect(screen.queryAllByTestId("assignment-gameboard-card")).toHaveLength(6);
    });

    it('should show all gameboards in table view', async () => {
        renderSetAssignments();
        // Change view to "Table View"
        const viewDropdown = await screen.findByLabelText("Display in");
        await userEvent.selectOptions(viewDropdown, "Table View");
        // Make sure that all gameboards are listed
        const gameboardRows = await screen.findAllByTestId("assignment-gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
    });

    it('should have links to gameboards/relevant info to setting assignments at the top of the page', async () => {
        renderSetAssignments();
        for (const [title, href] of Object.entries(expectedTopLinks)) {
            const button = await screen.findByRole("link", {name: title});
            expect(button.getAttribute("href")).toBe(href);
        }
    });

    it('should show all the correct information for a gameboard in card view', async () => {
        renderSetAssignments();
        const gameboards = await screen.findAllByTestId("assignment-gameboard-card");

        const gameboard = gameboards[0];
        const mockGameboard = mockGameboards.results[0];

        // Check that group count is correct
        const assignmentsToGameboard = mockSetAssignments.filter(a => a.gameboardId === mockGameboard.id);
        const groupsAssignedHexagon = await within(gameboard).findByTitle("Groups assigned");
        expect(groupsAssignedHexagon.textContent).toEqual(`${assignmentsToGameboard.length} group${assignmentsToGameboard.length === 1 ? "" : "s"}`);

        // Check that created date is present and in the expected format
        const dateText = within(gameboard).getByText("Created:").textContent?.replace(/Created:\s?/, "");
        expect(dateText).toMatch(DDMMYYYY_REGEX);
        expect(mockGameboard.creationDate - (dayMonthYearStringToDate(dateText)?.valueOf() ?? 0)).toBeLessThanOrEqual(ONE_DAY_IN_MS);

        // Check that stages are displayed
        const requiredStages = (mockGameboard.contents as {audience?: {stage?: STAGE[]}[]}[]).reduce(
            (set: Set<string>, q) => q.audience?.reduce(
                (_set: Set<string>, a) => a.stage?.reduce(
                    (__set: Set<string>, t) => __set.add(stageLabelMap[t]),
                    _set) ?? _set,
                set) ?? set,
            new Set<string>());
        const stages = within(gameboard).getByText("Stages:").textContent?.replace(/Stages:\s?/, "")?.split(/,\s?/);

        if (!stages || stages.length === 0) {
            expect(requiredStages.size).toBe(0);
        } else {
            requiredStages.forEach(s => {
                expect(stages?.includes(s)).toBeTruthy();
            });
            stages.forEach(s => {
                expect(requiredStages?.has(s)).toBeTruthy();
            });
        }

        // Check for difficulty title (can't really check the SVG unless we use a title or testid)
        within(gameboard).getByText("Difficulty:")

        // Ensure we have a title with a link to the gameboard
        const title = within(gameboard).getByRole("link", {name: mockGameboard.title})
        expect(title.getAttribute("href")).toBe(`/assignment/${mockGameboard.id}`);

        // Ensure the assign/unassign button exists
        within(gameboard).getByRole("button", {name: /Assign\s?\/\s?Unassign/})
    });

    // it('should let you assign a gameboard in card view (using the modal)', async () => {
    //     renderSetAssignments();
    //     const gameboards = await screen.findAllByTestId("assignment-gameboard-card");
    //     const assignButton = await within(gameboards[0]).
    // });
});
