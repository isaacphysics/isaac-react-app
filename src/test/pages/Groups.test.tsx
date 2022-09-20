import {screen, waitFor, within} from "@testing-library/react";
import {followHeaderNavLink, renderTestEnvironment} from "./utils";
import {mockGroups} from "../../mocks/data";
import {isDefined, siteSpecific} from "../../app/services";
import {difference} from "lodash";
import userEvent from "@testing-library/user-event";

describe("Groups", () => {

    it('displays all active groups on load, and all archived groups when Archived tab is clicked', async () => {
        renderTestEnvironment();
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const activeGroups = await screen.findAllByTestId("group-item");
        const maybeActiveGroupNames = activeGroups.map(g => within(g).queryByTestId("select-group")?.textContent);
        const activeGroupNames = maybeActiveGroupNames.filter(isDefined);
        // Expect all group names to be defined
        expect(activeGroupNames).toHaveLength(maybeActiveGroupNames.length);
        // Expect all mock groups to be active and displayed
        expect(difference(activeGroupNames, mockGroups.map(g => g.groupName))).toHaveLength(0);

        // Now check archived tab, should be empty
        const archivedTabLink = screen.getByText("Archived");
        await userEvent.click(archivedTabLink);
        await waitFor(() => {
            const archivedGroups = screen.queryAllByTestId("group-item");
            expect(archivedGroups).toHaveLength(0);
        });
    });
});
