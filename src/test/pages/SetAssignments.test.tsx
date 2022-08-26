import React from "react";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SetAssignments} from "../../app/components/pages/SetAssignments";
import {mockGameboards} from "../../mocks/data";
import {renderTestEnvironment} from "./utils";

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
});
