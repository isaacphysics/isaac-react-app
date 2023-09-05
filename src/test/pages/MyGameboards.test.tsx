import React from "react";
import {screen, waitFor} from "@testing-library/react";
import {mockGameboards} from "../../mocks/data";
import {MyGameboards} from "../../app/components/pages/MyGameboards";
import userEvent from "@testing-library/user-event";
import {renderTestEnvironment} from "../utils";
import {PATHS} from "../../app/services";

describe("MyGameboards", () => {

    const renderMyGameboards = () => {
        renderTestEnvironment({
            PageComponent: MyGameboards,
            initalRouteEntries: [PATHS.MY_GAMEBOARDS]
        });
    };

    it('should start in table view', async () => {
        renderMyGameboards();
        await waitFor(() => {
            expect(screen.queryAllByText("Loading...")).toHaveLength(0);
        });
        const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
        expect(viewDropdown.value).toEqual("Table View");
    });

    it('should show all of my gameboards in table view', async () => {
        renderMyGameboards();
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
    });

    it('should initially fetch the first 6 gameboards in card view', async () => {
        renderMyGameboards();
        // Change view to "Card View"
        const viewDropdown = await screen.findByLabelText("Display in");
        await userEvent.selectOptions(viewDropdown, "Card View");
        // Make sure that 6 gameboards in the response ---> 6 gameboards displayed
        const gameboardCards = await screen.findAllByTestId("gameboard-card");
        expect(gameboardCards).toHaveLength(6);
    });

    it('should filter gameboards by title in table view', async () => {
        renderMyGameboards();
        const titleFilter = await screen.findByTestId("title-filter");
        await userEvent.type(titleFilter, "test 1"); // Should match "Test Gameboard 1"
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(1);
    });
});
