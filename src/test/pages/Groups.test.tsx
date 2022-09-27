import {screen, waitFor, within} from "@testing-library/react";
import {renderTestEnvironment, followHeaderNavLink} from "./utils";
import {mockActiveGroups, mockArchivedGroups, mockGroups, mockUser, mockUserSummary} from "../../mocks/data";
import {API_PATH, isDefined, siteSpecific} from "../../app/services";
import {difference, isEqual} from "lodash";
import userEvent from "@testing-library/user-event";
import {rest} from "msw";
import {UserGroupDTO} from "../../IsaacApiTypes";

describe("Groups", () => {

    // Navigate to the manage groups page via the site navigation header, and open the given groups tab, making sure
    // that the groups we expect to be there, are there.
    // Returns a Promise that resolves with the group items in the given tab.
    const visitGroupPageOnTab = async (activeOrArchived: "active" | "archived", expectedGroups?: UserGroupDTO[]) => {
        const mockGroups = expectedGroups ?? (activeOrArchived === "active" ? mockActiveGroups : mockArchivedGroups);
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // Switch to Archived tab if we are deleting an archived group
        if (activeOrArchived === "archived") {
            const archivedTabLink = await screen.findByText("Archived");
            await userEvent.click(archivedTabLink);
        }
        let groups: HTMLElement[] = [];
        // Make sure we have the number and names of groups that we expect
        await waitFor(() => {
            groups = screen.queryAllByTestId("group-item");
            expect(groups).toHaveLength(mockGroups.length);
            expect(difference(groups.map(e => within(e).getByTestId("select-group").textContent), mockGroups.map(g => g.groupName))).toHaveLength(0);
        });
        return groups;
    };

    it('displays all active groups on load, and all archived groups when Archived tab is clicked', async () => {
        renderTestEnvironment();
        await visitGroupPageOnTab("active");
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
            expect(difference(archivedGroupNames, mockArchivedGroups.map(g => g.groupName))).toHaveLength(0);
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

    (["active", "archived"] as const).forEach((activeOrArchived) => {
        const mockGroups = activeOrArchived === "active" ? mockActiveGroups : mockArchivedGroups;
        it(`allows you to delete ${activeOrArchived} groups`, async () => {
            const groupToDelete = mockGroups[0];
            let correctDeleteRequests = 0;
            renderTestEnvironment({
                extraEndpoints: [
                    rest.delete(API_PATH + "/groups/:groupId", async (req, res, ctx) => {
                        const {groupId} = req.params;
                        if (parseInt(groupId as string) === groupToDelete.id) {
                            correctDeleteRequests++;
                        }
                        return res(ctx.status(204));
                    }),
                ]
            });
            const groups = await visitGroupPageOnTab(activeOrArchived);
            // Find delete button corresponding to group we want to delete
            const groupToDeleteElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToDelete.groupName) as HTMLElement;
            expect(groupToDeleteElement).toBeDefined();
            const deleteButton = within(groupToDeleteElement).getByRole("button", {description: "Delete group"});
            // Set up window.confirm mock - we want to accept the alert so return true in mock implementation
            window.confirm = jest.fn(() => true);
            await userEvent.click(deleteButton);
            // Make sure window.confirm was called...
            await waitFor(() => {
                expect(window.confirm).toHaveBeenCalledTimes(1);
            });
            // ...and that a single DELETE request is sent immediately after.
            await waitFor(() => {
                expect(correctDeleteRequests).toEqual(1);
            });
            // Assert that list of active groups has been optimistically updated, with ONLY the group we care about removed
            await waitFor(() => {
                const newGroupNames = screen.queryAllByTestId("group-item").map(e => within(e).getByTestId("select-group").textContent);
                expect(newGroupNames).not.toContain(groupToDelete.groupName);
                expect(newGroupNames).toHaveLength(groups.length - 1);
            });
        });

        it(`allows you to rename ${activeOrArchived} groups`, async () => {
            const groupToRename = mockGroups[0];
            const newGroupName = "Test Group Renamed";
            let correctUpdateRequests = 0;
            renderTestEnvironment({
                extraEndpoints: [
                    rest.post(API_PATH + "/groups/:groupId", async (req, res, ctx) => {
                        const {groupId} = req.params;
                        const updatedGroup = await req.json();
                        if (parseInt(groupId as string) === groupToRename.id && updatedGroup.groupName === newGroupName && isEqual(groupToRename, {...updatedGroup, groupName: newGroupName})) {
                            correctUpdateRequests++;
                        }
                        return res(ctx.status(204));
                    }),
                ]
            });
            const groups = await visitGroupPageOnTab(activeOrArchived);
            const groupNames = groups.map(e => within(e).getByTestId("select-group").textContent);
            const groupToRenameElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToRename.groupName) as HTMLElement;
            expect(groupToRenameElement).toBeDefined();
            // Open group editor for group to rename
            await userEvent.click(within(groupToRenameElement).getByTestId("select-group"));
            // Wait for "Edit group" panel to be open
            const groupEditor = await screen.findByTestId("group-editor");
            await waitFor(async () => {
                await within(groupEditor).findByText("Edit group");
            });
            // Rename the group and click update
            const groupNameInput = await within(groupEditor).findByPlaceholderText(/Group [Nn]ame/);
            await userEvent.clear(groupNameInput);
            await userEvent.type(groupNameInput, newGroupName);
            const updateButton = await within(groupEditor).findByRole("button", {name: "Update"});
            await userEvent.click(updateButton);
            // Make sure the list of groups contains the new name
            await waitFor(() => {
                const newGroups = screen.getAllByTestId("group-item");
                expect(newGroups).toHaveLength(groups.length);
                const newGroupNames = newGroups.map(e => within(e).getByTestId("select-group").textContent);
                expect(difference(groupNames, newGroupNames)).toEqual([groupToRename.groupName]);
                expect(difference(newGroupNames, groupNames)).toEqual([newGroupName]);
            });
        });
    });

    it("allows you to archive groups", async () => {
        const groupToArchive = mockActiveGroups[0];
        let correctUpdateRequests = 0;
        renderTestEnvironment({
            extraEndpoints: [
                rest.post(API_PATH + "/groups/:groupId", async (req, res, ctx) => {
                    const {groupId} = req.params;
                    const updatedGroup = await req.json();
                    // Request is correct if and only if the archived status has changed for the group that we expect
                    if (parseInt(groupId as string) === groupToArchive.id && updatedGroup.archived === true && isEqual(groupToArchive, {...updatedGroup, archived: false})) {
                        correctUpdateRequests++;
                    }
                    return res(
                        ctx.status(200),
                        ctx.json({...groupToArchive, archived: true})
                    );
                }),
                // We need to handle when the Archived tab requests the list of archived groups, because in this case
                // the optimistic update to the archived list falls flat - RTKQ cache updates can only occur if the
                // cache entry exists, but in this test the archived tab only gets visited for the first time AFTER
                // we try to update the cache.
                // If RTKQ cache gets an "upsert" function, then we can use that instead, and the below request handler
                // can be removed.
                rest.get(API_PATH + "/groups", (req, res, ctx) => {
                    const archived = req.url.searchParams.get("archived_groups_only") === "true";
                    const groups = archived ? [...mockArchivedGroups, {...groupToArchive, archived: true}] : mockActiveGroups;
                    return res(
                        ctx.status(200),
                        ctx.json(groups)
                    );
                })
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const groups = await screen.findAllByTestId("group-item");
        const groupToArchiveElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToArchive.groupName) as HTMLElement;
        expect(groupToArchiveElement).toBeDefined();
        const groupToArchiveName = within(groupToArchiveElement).getByTestId("select-group").textContent;
        await userEvent.click(within(groupToArchiveElement).getByTestId("select-group"));
        // We need to look within the element marked with the "group-editor" test ID, because there are actually
        // two GroupEditor components in the DOM at once, one is just hidden (depending on screen size).
        const groupEditor = await screen.findByTestId("group-editor");
        const archiveButton = await within(groupEditor).findByRole("button", {name: "Archive this group"});
        await userEvent.click(archiveButton);
        // Assert that the request was what we expect, and the archived group no longer exists in the list of active groups
        await waitFor(() => {
            expect(correctUpdateRequests).toEqual(1);
            const newGroupNames = screen.queryAllByTestId("group-item").map(e => within(e).getByTestId("select-group").textContent);
            expect(newGroupNames).not.toContain(groupToArchiveName);
            expect(newGroupNames).toHaveLength(groups.length - 1);
        });
        // Assert that the group is now in the archived tab, and is the only new one there
        const archivedTabLink = await screen.findByText("Archived");
        await userEvent.click(archivedTabLink);
        await waitFor(() => {
            const archivedGroups = screen.queryAllByTestId("group-item");
            expect(archivedGroups).toHaveLength(mockArchivedGroups.length + 1);
            expect(difference(archivedGroups.map(e => within(e).getByTestId("select-group").textContent), mockArchivedGroups.map(g => g.groupName))).toEqual([groupToArchiveName]);
        });
    });
});
