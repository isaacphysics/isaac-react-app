import {screen, waitFor, within} from "@testing-library/react";
import {renderTestEnvironment, followHeaderNavLink, NOW} from "./utils";
import {mockGroups, mockUser, mockUserSummary} from "../../mocks/data";
import {API_PATH, isDefined, siteSpecific} from "../../app/services";
import {difference} from "lodash";
import userEvent from "@testing-library/user-event";
import {rest} from "msw";

describe("Groups", () => {

    it('displays all active groups on load, and all archived groups when Archived tab is clicked', async () => {
        renderTestEnvironment();
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const activeGroups = await screen.findAllByTestId("group-item");
        const maybeActiveGroupNames = activeGroups.map(g => within(g).queryByTestId("select-group")?.textContent);
        const activeGroupNames = maybeActiveGroupNames.filter(isDefined);
        // Expect all group names to be defined
        expect(activeGroupNames).toHaveLength(maybeActiveGroupNames.length);
        // Expect all active mock groups to be displayed
        expect(difference(activeGroupNames, mockGroups.filter(g => !g.archived).map(g => g.groupName))).toHaveLength(0);

        // Now check archived tab, should contain one archived group
        const archivedTabLink = screen.getByText("Archived");
        await userEvent.click(archivedTabLink);
        await waitFor(() => {
            const archivedGroups = screen.queryAllByTestId("group-item");
            const maybeArchivedGroupNames = archivedGroups.map(g => within(g).queryByTestId("select-group")?.textContent);
            const archivedGroupNames = maybeArchivedGroupNames.filter(isDefined);
            // Expect all group names to be defined
            expect(archivedGroupNames).toHaveLength(maybeArchivedGroupNames.length);
            // Expect all active mock groups to be displayed
            expect(difference(archivedGroupNames, mockGroups.filter(g => g.archived).map(g => g.groupName))).toHaveLength(0);
        });
    });

    it('allows you to create a new group', async () => {
        const newGroupId = 42;
        const newGroupName = "new group";
        const mockToken = "E990S1";
        let correctNewGroupRequests = 0;
        let authTokenRequests = 0;
        renderTestEnvironment({
            extraEndpoints: [
                rest.post(API_PATH + "/groups", async (req, res, ctx) => {
                    const body = await req.json();
                    if ("groupName" in body && body.groupName === newGroupName) {
                        correctNewGroupRequests++;
                    }
                    return res(
                        ctx.status(200),
                        ctx.json({
                            id: newGroupId,
                            groupName: body.groupName,
                            ownerId: mockUser.id,
                            created: Date.now(),
                            lastUpdated: Date.now(),
                            ownerSummary: mockUserSummary,
                            archived: false
                        })
                    );
                }),
                rest.get(API_PATH + `/authorisations/token/${newGroupId}`, (req, res, ctx) => {
                    authTokenRequests++;
                    return res(
                        ctx.status(200),
                        ctx.json({
                            token: mockToken,
                            ownerUserId: mockUser.id,
                            groupId: newGroupId
                        })
                    );
                }),
                rest.get(API_PATH + `/groups/${newGroupId}/membership`, (req, res, ctx) => {
                    return res(
                        ctx.status(200),
                        ctx.json([])
                    );
                })
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // Implicitly expecting that opening the "Manage Groups" page shows you the create new group form first
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, newGroupName);
        const createButton = await screen.findByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        // Expect that the new group POST request is made exactly once
        await waitFor(() => {
            expect(correctNewGroupRequests).toEqual(1);
        });
        const modal = await screen.findByTestId("active-modal");
        // Expect that the auth token GET request is made exactly once
        await waitFor(() => {
            expect(authTokenRequests).toEqual(1);
        });
        // Expect the share link and share code to be shown on the modal
        const link = await within(modal).findByTestId("share-link");
        const code = await within(modal).findByTestId("share-code");
        expect(link.textContent).toMatch(new RegExp(`\/account\\?authToken=${mockToken}`));
        expect(code.textContent).toEqual(mockToken);
    });
});
