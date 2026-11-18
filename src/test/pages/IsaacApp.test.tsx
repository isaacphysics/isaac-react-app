import {screen, waitFor} from "@testing-library/react";
import {renderTestEnvironment} from "../testUtils";
import { siteSpecific } from "../../app/services";

describe("IsaacApp", () => {

    it('should open on the home page', async () => {
        await renderTestEnvironment();
        await waitFor(() => {
            expect(window.location.pathname).toBe("/");
        });
    });

    it('should show the users number of current assignments in the navigation menu', async () => {
        await renderTestEnvironment();
        const myAssignmentsBadge = await screen.findByTestId(siteSpecific("my-assignments-badge", "my-notifications-badge"));
        expect(myAssignmentsBadge.textContent).toContain("5");
    });
});
