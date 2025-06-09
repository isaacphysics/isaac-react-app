import {screen, waitFor} from "@testing-library/react";
import {mockGameboards} from "../../mocks/data";
import {MyGameboards} from "../../app/components/pages/MyGameboards";
import userEvent from "@testing-library/user-event";
import {renderTestEnvironment} from "../testUtils";
import {isAda, isPhy, PATHS} from "../../app/services";

describe("MyGameboards", () => {

    const renderMyGameboards = () => {
        renderTestEnvironment({
            PageComponent: MyGameboards,
            initalRouteEntries: [PATHS.MY_GAMEBOARDS]
        });
    };

    it('should start in card view on phy and table view on Ada', async () => {
        renderMyGameboards();
        await waitFor(() => {
            expect(screen.queryAllByText("Loading...")).toHaveLength(0);
        });
        if (isPhy) {
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Set display mode");
            expect(viewDropdown.value).toEqual("Card View");
        }
        else {
            const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
            expect(viewDropdown.value).toEqual("Table View");
        }
    });

    it('should show all of my gameboards in table view', async () => {
        renderMyGameboards();
        if (isPhy) {
            // Change view to "Table View" on phy
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Table View");
        }
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
        if (isPhy) {
            // Phy persists the change to table view, so switch back to card view for subsequent tests
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
    });

    it('should initially fetch the first 6 gameboards in card view', async () => {
        renderMyGameboards();
        if (isAda) {
            // Change view to "Card View" on Ada
            const viewDropdown = await screen.findByLabelText("Display in");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
        // Make sure that 6 gameboards in the response ---> 6 gameboards displayed
        const gameboardCards = await screen.findAllByTestId("gameboard-card");
        expect(gameboardCards).toHaveLength(6);
    });

    it('should filter gameboards by title in table view', async () => {
        renderMyGameboards();
        if (isPhy) {
            // Change view to "Table View" on phy
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Table View");
        }
        const titleFilter = await screen.findByTestId("title-filter");
        await userEvent.type(titleFilter, "test 1"); // Should match "Test Gameboard 1"
        const gameboardRows = await screen.findAllByTestId("gameboard-table-row");
        expect(gameboardRows).toHaveLength(1);
        if (isPhy) {
            // Phy persists the change to table view, so switch back to card view for subsequent tests
            const viewDropdown = await screen.findByLabelText("Set display mode");
            await userEvent.selectOptions(viewDropdown, "Card View");
        }
    });
});
