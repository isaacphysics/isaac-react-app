import React from "react";
import {rest} from "msw";
import {API_PATH} from "../../app/services/constants";
// Importing "/pure" means that tests ARE NOT CLEANED UP automatically
import {cleanup, render, screen, waitFor} from "@testing-library/react/pure";
import {mockGameboards} from "../../mocks/data";
import {Provider} from "react-redux";
import {isaacApi, requestCurrentUser, store} from "../../app/state";
import {MemoryRouter} from "react-router";
import {MyGameboards} from "../../app/components/pages/MyGameboards";
import {server} from "../../mocks/server";
import produce from "immer";
import userEvent from "@testing-library/user-event";

describe("MyGameboards", () => {

    beforeAll(() => {
        store.dispatch(requestCurrentUser());
        render(<Provider store={store}>
            <MemoryRouter initialEntries={["/my_gameboards"]}>
                <MyGameboards/>
            </MemoryRouter>
        </Provider>);
    });

    afterAll(() => {
        // We have to do this manually because we imported /pure and we
        // don't want to affect the next test suite
        cleanup();
        store.dispatch(isaacApi.util.resetApiState());
    });

    it('should start in table view', async () => {
        await waitFor(() => {
            expect(screen.queryByText("Loading...")).toBeNull();
        });
        const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
        expect(viewDropdown.value).toEqual("Table View");
    });

    it('should show all of my gameboards in table view', async () => {
        const gameboardRows = await screen.findAllByTestId("my-gameboard-table-row");
        expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
    });

    it('should initially fetch the first 6 gameboards in card view', async () => {
        let startIndex: number;
        let limit: number;
        // Add a handler to return 6 gameboards on request
        server.use(
            rest.get(API_PATH + "/gameboards/user_gameboards", (req, res, ctx) => {
                const startIndexStr = req.url.searchParams.get("start_index");
                startIndex = (startIndexStr && parseInt(startIndexStr)) || 0;
                const limitStr = req.url.searchParams.get("limit");
                limit = (limitStr && parseInt(limitStr)) || mockGameboards.totalResults;

                const sixGameboards = produce(mockGameboards, g => {
                    g.results = g.results.slice(0, 6);
                    g.totalNotStarted = 6;
                    g.totalResults = 6;
                });

                return res(
                    ctx.status(200),
                    ctx.json(sixGameboards)
                )
            }),
        );
        // Change view to "Card View"
        const viewDropdown = await screen.findByLabelText("Display in");
        await userEvent.selectOptions(viewDropdown, "Card View");
        // Ensure that the expected parameters were used in the gameboards request
        await waitFor(() => {
            expect(startIndex).toBe(0);
            expect(limit).toBe(6);
        });
        // Make sure that 6 gameboards in the response ---> 6 gameboards displayed
        const gameboardCards = await screen.findAllByTestId("my-gameboard-card");
        expect(gameboardCards).toHaveLength(6);
    });
});
