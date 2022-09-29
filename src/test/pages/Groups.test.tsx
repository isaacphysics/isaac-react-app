import {screen, waitFor, within} from "@testing-library/react";
import {renderTestEnvironment, followHeaderNavLink} from "../utils";
import {mockActiveGroups, mockArchivedGroups, mockTeacher, mockUser, mockUserSummary} from "../../mocks/data";
import {API_PATH, isDefined, siteSpecific} from "../../app/services";
import {difference, isEqual} from "lodash";
import userEvent from "@testing-library/user-event";
import {ResponseResolver, rest} from "msw";
import {UserGroupDTO} from "../../IsaacApiTypes";

// --- Extra mock data and MSW handlers ---

const newGroupId = 42;
const newGroupName = "new group";
const mockNewGroup = {
    id: newGroupId,
    groupName: newGroupName,
    ownerId: mockUser.id,
    created: Date.now(),
    lastUpdated: Date.now(),
    ownerSummary: mockUserSummary,
    archived: false
};
const mockToken = "E990S1";
const newGroupHandler = jest.fn((req, res, ctx) => {
    return res(
        ctx.status(200),
        ctx.json(mockNewGroup)
    );
});
const authTokenHandler = jest.fn((req, res, ctx) => {
    return res(
        ctx.status(200),
        ctx.json({
            token: mockToken,
            ownerUserId: mockUser.id,
            groupId: newGroupId
        })
    );
});
const createGroupEndpoints = [
    rest.post(API_PATH + "/groups", newGroupHandler),
    rest.get(API_PATH + `/authorisations/token/${newGroupId}`, authTokenHandler),
];
const buildNewManagerHandler = (groupToAddManagerTo: any) => jest.fn((req, res, ctx) => {
    return res(
        ctx.status(200),
        ctx.json({
            ...groupToAddManagerTo,
            additionalManagers: [mockUserSummary(mockTeacher, true)]
        })
    );
});

// --- Helper functions ---

// Open the given groups tab, making sure that the groups we expect to be there, are there.
// Returns a Promise that resolves with the group items in the given tab.
const switchGroupsTab = async (activeOrArchived: "active" | "archived", expectedGroups?: UserGroupDTO[]) => {
    const mockGroups = expectedGroups ?? (activeOrArchived === "active" ? mockActiveGroups : mockArchivedGroups);
    // Switch to the correct tab
    const archivedTabLink = await screen.findByText(activeOrArchived === "archived" ? "Archived" : "Active");
    await userEvent.click(archivedTabLink);
    let groups: HTMLElement[] = [];
    // Make sure we have the number and names of groups that we expect
    await waitFor(() => {
        groups = screen.queryAllByTestId("group-item");
        expect(groups).toHaveLength(mockGroups.length);
        expect(difference(groups.map(e => within(e).getByTestId("select-group").textContent), mockGroups.map(g => g.groupName))).toHaveLength(0);
    });
    return groups;
};

// Reusable test for the additional manager modal
const testAdditionalManagerModal = async (managerHandler: ResponseResolver) => {
    let groupManagersModal: HTMLElement | undefined;
    await waitFor(() => {
        groupManagersModal = screen.getByTestId("active-modal");
        expect(within(groupManagersModal).getByText("Share your group")).toBeDefined();
    });
    if (!groupManagersModal) fail(); // Shouldn't happen because of the above `waitFor`
    const addManagerInput = within(groupManagersModal).getByPlaceholderText("Enter email address here");
    await userEvent.type(addManagerInput, mockTeacher.email);
    const addManagerButton = within(groupManagersModal).getByRole("button", {name: "Add group manager"});
    await userEvent.click(addManagerButton);
    // Expect correct email was sent in request
    await waitFor(() => {
        expect(managerHandler).toHaveBeenCalledTimes(1);
    });
    await expect(managerHandler).toHaveBeenRequestedWith(async (req) => {
        const {email} = await req.json();
        return email === mockTeacher.email;
    });
    // Expect that new additional manager is shown in modal
    await waitFor(() => {
        const managerElements = within(groupManagersModal as HTMLElement).queryAllByTestId("group-manager");
        expect(managerElements).toHaveLength(1);
        expect(managerElements[0]).toHaveTextContent(new RegExp(mockTeacher.email));
    });
};

describe("Groups", () => {

    it('displays all active groups on load, and all archived groups when Archived tab is clicked', async () => {
        renderTestEnvironment();
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // switchGroupsTab checks that the mock active groups we expect to be there are in fact there
        await switchGroupsTab("active");
        // Now check archived tab, should contain all archived groups
        const archivedTabLink = screen.getByText("Archived");
        await userEvent.click(archivedTabLink);
        await waitFor(() => {
            const archivedGroups = screen.queryAllByTestId("group-item");
            const maybeArchivedGroupNames = archivedGroups.map(g => within(g).getByTestId("select-group").textContent);
            const archivedGroupNames = maybeArchivedGroupNames.filter(isDefined);
            // Expect all group names to be defined
            expect(archivedGroupNames).toHaveLength(maybeArchivedGroupNames.length);
            // Expect all active mock groups to be displayed
            expect(difference(archivedGroupNames, mockArchivedGroups.map(g => g.groupName))).toHaveLength(0);
        });
    });

    it('allows you to create a new group', async () => {
        renderTestEnvironment({extraEndpoints: createGroupEndpoints});
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // Implicitly expecting that opening the "Manage Groups" page shows you the create new group form first
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, newGroupName);
        const createButton = await screen.findByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        // Expect that the new group POST request is made exactly once
        await waitFor(() => {
            expect(newGroupHandler).toHaveBeenCalledTimes(1);
        });
        await expect(newGroupHandler).toHaveBeenRequestedWith(async (req) => {
            const body = await req.json();
            return "groupName" in body && body.groupName === newGroupName;
        });
        const modal = await screen.findByTestId("active-modal");
        // Expect that the auth token GET request is made exactly once
        await waitFor(() => {
            expect(authTokenHandler).toHaveBeenCalledTimes(1);
        });
        // Expect the share link and share code to be shown on the modal
        const link = await within(modal).findByTestId("share-link");
        const code = await within(modal).findByTestId("share-code");
        expect(link.textContent).toMatch(new RegExp(`\/account\\?authToken=${mockToken}`));
        expect(code.textContent).toEqual(mockToken);
    });

    (["active", "archived"] as const).forEach((activeOrArchived) => {
        const mockGroups = activeOrArchived === "active" ? mockActiveGroups : mockArchivedGroups;
        const mockOtherGroups = activeOrArchived === "active" ? mockArchivedGroups : mockActiveGroups;
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
            await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
            const groups = await switchGroupsTab(activeOrArchived);
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
                        if (parseInt(groupId as string) === groupToRename.id && updatedGroup.groupName === newGroupName && isEqual(groupToRename, {...updatedGroup, groupName: groupToRename.groupName})) {
                            correctUpdateRequests++;
                        }
                        return res(ctx.status(204));
                    }),
                ]
            });
            await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
            const groups = await switchGroupsTab(activeOrArchived);
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
            // Assert the correct number of update requests were sent
            expect(correctUpdateRequests).toEqual(1);
        });

        (activeOrArchived === "active" ? [false, true] : [false]).forEach((shouldTryToShowArchivedTabFirst) => {
            it(`allows you to ${activeOrArchived === "active" ? "" : "un"}archive groups${shouldTryToShowArchivedTabFirst ? ", after switching to the Archived tab first" : ""}`, async () => {
                const groupToModify = mockGroups[0];
                const newArchivedValue = activeOrArchived === "active";
                // Request handlers
                const updateGroup = jest.fn(async (req, res, ctx) => {
                    return res(
                        ctx.status(200),
                        ctx.json({...groupToModify, archived: newArchivedValue})
                    );
                });
                const getGroups = jest.fn((req, res, ctx) => {
                    const archived = req.url.searchParams.get("archived_groups_only") === "true";
                    const groups = archived === newArchivedValue ? (shouldTryToShowArchivedTabFirst ? mockOtherGroups : [...mockOtherGroups, {
                        ...groupToModify,
                        archived: newArchivedValue
                    }]) : mockGroups;
                    return res(
                        ctx.status(200),
                        ctx.json(groups)
                    );
                });
                renderTestEnvironment({
                    extraEndpoints: [
                        rest.post(API_PATH + "/groups/:groupId", updateGroup),
                        // We need to handle when the Archived tab requests the list of archived groups, because in this case
                        // the optimistic update to the archived list falls flat - RTKQ cache updates can only occur if the
                        // cache entry exists, but in this test the archived tab only gets visited for the first time AFTER
                        // we try to update the cache.
                        // If RTKQ cache gets an "upsert" function, then we can use that instead, and the below request handler
                        // can be removed.
                        rest.get(API_PATH + "/groups", getGroups)
                    ]
                });
                await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
                // Try to flick to the archived tab first, to test whether the cache updates work correctly
                if (shouldTryToShowArchivedTabFirst) {
                    await switchGroupsTab("archived");
                }
                const groups = await switchGroupsTab(activeOrArchived);
                const groupToModifyElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToModify.groupName) as HTMLElement;
                expect(groupToModifyElement).toBeDefined();
                const groupToModifyName = within(groupToModifyElement).getByTestId("select-group").textContent;
                await userEvent.click(within(groupToModifyElement).getByTestId("select-group"));
                // We need to look within the element marked with the "group-editor" test ID, because there are actually
                // two GroupEditor components in the DOM at once, one is just hidden (depending on screen size).
                const groupEditor = await screen.findByTestId("group-editor");
                const archiveButton = await within(groupEditor).findByRole("button", {name: `${activeOrArchived === "active" ? "A" : "Una"}rchive this group`});
                await userEvent.click(archiveButton);
                // Assert that the request was called, and the modified group no longer exists in the initial list of groups
                await waitFor(() => {
                    expect(updateGroup).toHaveBeenCalledTimes(1);
                    const newGroupNames = screen.queryAllByTestId("group-item").map(e => within(e).getByTestId("select-group").textContent);
                    expect(newGroupNames).not.toContain(groupToModifyName);
                    expect(newGroupNames).toHaveLength(groups.length - 1);
                });
                // Assert that the request was what we expected
                await expect(updateGroup).toHaveBeenRequestedWith(async (req) => {
                    const {groupId} = req.params;
                    const updatedGroup = await req.json();
                    // Request is correct if and only if the archived status has changed for the group that we expect
                    return parseInt(groupId as string) === groupToModify.id && updatedGroup.archived === newArchivedValue && isEqual(groupToModify, {
                        ...updatedGroup,
                        archived: !newArchivedValue
                    });
                });
                // Assert that the group is now in the other tab, and is the only new one there
                const nextTabLink = await screen.findByText(activeOrArchived === "active" ? "Archived" : "Active");
                await userEvent.click(nextTabLink);
                await waitFor(() => {
                    const otherGroups = screen.queryAllByTestId("group-item");
                    expect(otherGroups).toHaveLength(mockOtherGroups.length + 1);
                    expect(difference(otherGroups.map(e => within(e).getByTestId("select-group").textContent), mockOtherGroups.map(g => g.groupName))).toEqual([groupToModifyName]);
                });
                // Ensure that in any case (whether we switched to the archived tab before doing anything or not), only
                // two GET requests to the /groups endpoint were made, one for each tab
                expect(getGroups).toHaveBeenCalledTimes(2);
                await expect(getGroups).toHaveBeenRequestedWith((req) => {
                    return req.url.searchParams.get("archived_groups_only") === "true";
                });
                await expect(getGroups).toHaveBeenRequestedWith((req) => {
                    return req.url.searchParams.get("archived_groups_only") === "false";
                });
            });
        });

        it(`allows you to add new group managers to an existing ${activeOrArchived} group`, async () => {
            const group = mockGroups[0];
            const existingGroupManagerHandler = buildNewManagerHandler(group);
            renderTestEnvironment({
                extraEndpoints: createGroupEndpoints.concat([rest.post(API_PATH + `/groups/${group.id}/manager`, existingGroupManagerHandler)])
            });
            await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
            const groups = await switchGroupsTab(activeOrArchived);
            const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === group.groupName) as HTMLElement).getByTestId("select-group");
            await userEvent.click(selectGroupButton);
            const groupEditor = await screen.findByTestId("group-editor");
            const addManagersButton = within(groupEditor).getByRole("button", {name: "Add / remove group managers"});
            await userEvent.click(addManagersButton);
            await testAdditionalManagerModal(existingGroupManagerHandler);
        });
    });

    it("allows you to add new group managers in the modal after creating a new group", async () => {
        const newGroupManagerHandler = buildNewManagerHandler(mockNewGroup);
        renderTestEnvironment({
            extraEndpoints: createGroupEndpoints.concat([rest.post(API_PATH + `/groups/${newGroupId}/manager`, newGroupManagerHandler)])
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, newGroupName);
        const createButton = await screen.findByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        const firstModal = await screen.findByTestId("active-modal");
        // Expect the "add group managers" button to be shown on the modal
        const addGroupManagersButton = await within(firstModal).findByRole("button", {name: "Add group managers"});
        await userEvent.click(addGroupManagersButton);
        await testAdditionalManagerModal(newGroupManagerHandler);
    });
});
