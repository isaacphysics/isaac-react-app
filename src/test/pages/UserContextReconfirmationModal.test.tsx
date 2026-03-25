import {screen} from "@testing-library/react";
import {MOST_RECENT_AUGUST} from "../../app/state";
import produce from "immer";
import {renderTestEnvironment} from "../testUtils";

describe("UserContextReconfirmationModal", () => {

    it('should not show if the user has recently updated their audience context information', async () => {
        await renderTestEnvironment();
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        // Check for modals
        const modals = screen.queryAllByTestId("active-modal");
        if (modals.length > 0) {
            // If there is another modal, it shouldn't be the audience context update one
            expect(modals[0]).not.toHaveModalTitle("Review your details");
            // There should only be one modal on the screen at a time
            expect(modals).toHaveLength(1);
        } else {
            expect(modals).toHaveLength(0);
        }
    });

    it('should show if the user has not updated their audience context information since last August', async () => {
        await renderTestEnvironment({
            modifyUser: user => produce(user, u => {
                u.registeredContextsLastConfirmed = MOST_RECENT_AUGUST().valueOf() - 10000000;
            })
        });
        const modal = await screen.findByTestId("active-modal");
        expect(modal).toHaveModalTitle("Review your details");
    });
});
