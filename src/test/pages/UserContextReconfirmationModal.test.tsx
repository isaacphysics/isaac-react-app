import {cleanup, render, screen, waitFor, within} from "@testing-library/react/pure";
import {Provider} from "react-redux";
import {isaacApi, logOutUser, MOST_RECENT_AUGUST, store} from "../../app/state";
import React from "react";
import {IsaacApp} from "../../app/components/navigation/IsaacApp";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import {server} from "../../mocks/server";
import {rest} from "msw";
import {API_PATH} from "../../app/services/constants";
import {mockUser} from "../../mocks/data";
import produce from "immer";

jest.spyOn(Storage.prototype, 'getItem');
Storage.prototype.getItem = jest.fn(() => null);

describe("UserContextReconfirmationModal", () => {

    beforeAll(() => {
        render(<Provider store={store}>
            <IsaacApp/>
        </Provider>);
    });

    afterEach(() => {
        // We have to do this manually because we imported /pure and we
        // don't want to affect the next test suite
        cleanup();
        store.dispatch(logOutUser());
        store.dispatch(isaacApi.util.resetApiState());
    });

    it('should not show if the user has recently updated their audience context information', async () => {
        await userEvent.click(await screen.findByRole("link", {name: /My Isaac/i}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /My Gameboards/i}));
        const modals = screen.queryAllByTestId("active-modal");
        if (modals.length > 0) {
            expect(within(modals[0]).queryByText("Please review your details")).toBeNull();
        } else {
            expect(modals).toHaveLength(0);
        }
    });

    it('should show if the user has not updated their audience context information since last August', async () => {
        server.use(
            rest.get(API_PATH + "/users/current_user", (req, res, ctx) => {
                const userWithOldData = produce(mockUser, u => {
                    u.registeredContextsLastConfirmed = MOST_RECENT_AUGUST().valueOf() - 10000000;
                });
                return res(
                    ctx.status(200),
                    ctx.json(userWithOldData)
                );
            }),
        );
        render(<Provider store={store}>
            <IsaacApp/>
        </Provider>);
        await userEvent.click(await screen.findByRole("link", {name: /My Isaac/i}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /My Gameboards/i}));
        await waitFor(() => {
            expect(within(screen.getByTestId("active-modal")).queryByText("Please review your details")).not.toBeNull();
        });
    });
});