import React from "react";
import {cleanup, screen, waitFor, within} from "@testing-library/react/pure";
import {MOST_RECENT_AUGUST} from "../../app/state";
import "@testing-library/jest-dom/extend-expect";
import produce from "immer";
import {renderTestEnvironment} from "./utils";

describe("UserContextReconfirmationModal", () => {

    it('should not show if the user has recently updated their audience context information', async () => {
        renderTestEnvironment();
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        // Check for any modals
        const modals = screen.queryAllByTestId("active-modal");
        if (modals.length > 0) {
            expect(within(modals[0]).queryByText("Please review your details")).toBeNull();
            // There should only be one modal on the screen at a time
            expect(modals).toHaveLength(1);
        } else {
            expect(modals).toHaveLength(0);
        }
        cleanup();
    });

    it('should show if the user has not updated their audience context information since last August', async () => {
        renderTestEnvironment({
            modifyUser: user => produce(user, u => {
                u.registeredContextsLastConfirmed = MOST_RECENT_AUGUST().valueOf() - 10000000;
            })
        });
        await waitFor(() => {
            expect(within(screen.getByTestId("active-modal")).queryByText("Please review your details")).not.toBeNull();
        });
        cleanup();
    });
});