import {screen, waitFor} from "@testing-library/react";
import {mockGameboards} from "../../mocks/data";
import {MyGameboards} from "../../app/components/pages/MyGameboards";
import userEvent from "@testing-library/user-event";
import {renderTestEnvironment} from "../utils";

describe("MyGameboards", () => {

    const renderMyGameboards = () => {
        renderTestEnvironment({
            PageComponent: MyGameboards,
            initialRouteEntries: ["/assignments"]
        });
    };

    it('should start in table view', async () => {
        renderMyGameboards();
        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });
        const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
        expect(viewDropdown.value).toEqual("Table View");
    });

    it('should show all of my gameboards in table view', async () => {
        renderMyGameboards();
        const gameboardRows = await screen.findAllByTestId("my-gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
    });

    it('should initially fetch the first 6 gameboards in card view', async () => {
        renderMyGameboards();
        // Change view to "Card View"
        const viewDropdown = await screen.findByLabelText("Display in");
        await userEvent.selectOptions(viewDropdown, "Card View");
        // Make sure that 6 gameboards in the response ---> 6 gameboards displayed
        const gameboardCards = await screen.findAllByTestId("my-gameboard-card");
        expect(gameboardCards).toHaveLength(6);
    });
});
