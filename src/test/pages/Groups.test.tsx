import {screen, waitFor, within} from "@testing-library/react";
import {renderTestEnvironment, followHeaderNavLink} from "../utils";
import {
    mockActiveGroups,
    mockArchivedGroups,
    buildMockTeacher,
    mockUser,
    buildMockUserSummary,
    mockGroups,
    buildMockStudent,
    buildMockUserSummaryWithGroupMembership
} from "../../mocks/data";
import {API_PATH, isDefined, siteSpecific} from "../../app/services";
import {difference, isEqual} from "lodash";
import userEvent from "@testing-library/user-event";
import {ResponseResolver, rest} from "msw";
import {
    buildAuthTokenHandler,
    buildGroupHandler,
    buildGroupMembershipsHandler,
    buildNewGroupHandler,
    buildNewManagerHandler
} from "../../mocks/handlers";

// --- Helper functions ---

// Open the given groups tab, making sure that the groups we expect to be there, are there.
// Returns a Promise that resolves with the group items in the given tab.
const switchGroupsTab = async (activeOrArchived: "active" | "archived", expectedGroups: any[]) => {
    // Switch to the correct tab
    const archivedTabLink = await screen.findByText(activeOrArchived === "archived" ? "Archived" : "Active");
    await userEvent.click(archivedTabLink);
    let groups: HTMLElement[] = [];
    // Make sure we have the number and names of groups that we expect
    await waitFor(() => {
        groups = screen.queryAllByTestId("group-item");
        expect(groups).toHaveLength(expectedGroups.length);
        expect(difference(groups.map(e => within(e).getByTestId("select-group").textContent), expectedGroups.map(g => g.groupName))).toHaveLength(0);
    });
    return groups;
};

// Reusable test for adding a manager in the additional manager modal
const testAddAdditionalManagerInModal = async (managerHandler: ResponseResolver, newManager: any) => {
    let groupManagersModal: HTMLElement | undefined;
    await waitFor(() => {
        groupManagersModal = screen.getByTestId("active-modal");
        expect(groupManagersModal).toHaveModalTitle("Share your group");
    });
    if (!groupManagersModal) fail(); // Shouldn't happen because of the above `waitFor`
    const addManagerInput = within(groupManagersModal).getByPlaceholderText("Enter email address here");
    await userEvent.type(addManagerInput, newManager.email);
    const addManagerButton = within(groupManagersModal).getByRole("button", {name: "Add group manager"});
    await userEvent.click(addManagerButton);
    // Expect correct email was sent in request
    await waitFor(() => {
        expect(managerHandler).toHaveBeenCalledTimes(1);
    });
    expect(managerHandler).toHaveBeenRequestedWith(async (req) => {
        const {email} = await req.json();
        return email === newManager.email;
    });
    // Expect that new additional manager is shown in modal
    await waitFor(() => {
        const managerElements = within(groupManagersModal as HTMLElement).queryAllByTestId("group-manager");
        expect(managerElements).toHaveLength(1);
        expect(managerElements[0]).toHaveTextContent(newManager.email);
        // User should be able to see the remove button, since they are the owner
        const removeButton = within(managerElements[0]).getByRole("button", {name: "Remove"});
        expect(removeButton).toBeVisible();
    });
};

describe("Groups", () => {

    const roles = ["TUTOR", "TEACHER"] as const;

    it.each(roles)(`displays all active groups on load if the user is a %s, and all archived groups when Archived tab is clicked`, async (role) => {
        renderTestEnvironment({role});
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // switchGroupsTab checks that the mock active groups we expect to be there are in fact there
        await switchGroupsTab("active", mockActiveGroups);
        // Now check archived tab, should contain all archived groups
        const archivedTabLink = screen.getByText("Archived");
        await userEvent.click(archivedTabLink);
        const archivedGroups = await screen.findAllByTestId("group-item");
        const maybeArchivedGroupNames = archivedGroups.map(g => within(g).getByTestId("select-group").textContent);
        const archivedGroupNames = maybeArchivedGroupNames.filter(isDefined);
            // Expect all group names to be defined
        expect(archivedGroupNames).toHaveLength(maybeArchivedGroupNames.length);
            // Expect all active mock groups to be displayed
        expect(difference(archivedGroupNames, mockArchivedGroups.map(g => g.groupName))).toHaveLength(0);
        });
    
    it('allows you to create a new group', async () => {
        const mockToken = "E990S1";
        const mockNewGroup = {
            id: 42,
            groupName: "new group",
            ownerId: mockUser.id,
            created: Date.now(),
            lastUpdated: Date.now(),
            ownerSummary: buildMockUserSummary(mockUser, false),
            archived: false
        };
        const newGroupHandler = buildNewGroupHandler(mockNewGroup);
        const authTokenHandler = buildAuthTokenHandler(mockNewGroup, mockToken);
        renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                rest.post(API_PATH + "/groups", newGroupHandler),
                rest.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, authTokenHandler),
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        // Implicitly expecting that opening the "Manage Groups" page shows you the create new group form first
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = await screen.findByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        // Expect that the new group POST request is made exactly once
        await waitFor(() => {
            expect(newGroupHandler).toHaveBeenCalledTimes(1);
        });
        expect(newGroupHandler).toHaveBeenRequestedWith(async (req) => {
            const body = await req.json();
            return "groupName" in body && body.groupName === mockNewGroup.groupName;
        });
        const modal = await screen.findByTestId("active-modal");
        // Expect that the auth token GET request is made exactly once
        expect(modal).toHaveModalTitle("Group Created");
        expect(authTokenHandler).toHaveBeenCalledTimes(1); 
        // Expect the share link and share code to be shown on the modal
        const link = await within(modal).findByTestId("share-link");
        const code = await within(modal).findByTestId("share-code");
        expect(link).toHaveTextContent(`/account?authToken=${mockToken}`);
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
            const groups = await switchGroupsTab(activeOrArchived, mockGroups);
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
            const groups = await switchGroupsTab(activeOrArchived, mockGroups);
            const groupNames = groups.map(e => within(e).getByTestId("select-group").textContent);
            const groupToRenameElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToRename.groupName) as HTMLElement;
            expect(groupToRenameElement).toBeDefined();
            // Open group editor for group to rename
            await userEvent.click(within(groupToRenameElement).getByTestId("select-group"));
            // Wait for "Edit group" panel to be open
            const groupEditor = await screen.findByTestId("group-editor");
            await waitFor(() => within(groupEditor).getByText("Edit group"));
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
                    await switchGroupsTab("archived", mockArchivedGroups);
                }
                const groups = await switchGroupsTab(activeOrArchived, mockGroups);
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
                expect(updateGroup).toHaveBeenRequestedWith(async (req) => {
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
                expect(getGroups).toHaveBeenRequestedWith((req) => {
                    return req.url.searchParams.get("archived_groups_only") === "true";
                });
                expect(getGroups).toHaveBeenRequestedWith((req) => {
                    return req.url.searchParams.get("archived_groups_only") === "false";
                });
            });
        });

        it(`allows teacher owners of a group to add new group managers to an existing ${activeOrArchived} group`, async () => {
            const mockGroup = {
                ...mockGroups[0],
                ownerId: mockUser.id,
                ownerSummary: buildMockUserSummary(mockUser, false),
            };
            const mockNewManager = buildMockTeacher(2);
            const existingGroupManagerHandler = buildNewManagerHandler(mockGroup, mockNewManager);
            renderTestEnvironment({
                role: "TEACHER",
                extraEndpoints: [
                    rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                    rest.post(API_PATH + `/groups/${mockGroup.id}/manager`, existingGroupManagerHandler)
                ]
            });
            await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
            const groups = await switchGroupsTab(activeOrArchived, [mockGroup]);
            const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
            await userEvent.click(selectGroupButton);
            const groupEditor = await screen.findByTestId("group-editor");
            const addManagersButton = within(groupEditor).getByRole("button", {name: "Add / remove group managers"});
            await userEvent.click(addManagersButton);
            await testAddAdditionalManagerInModal(existingGroupManagerHandler, mockNewManager);
        });

        it(`does not allow tutor owners of a group to add new group managers to an existing ${activeOrArchived} group`, async () => {
            const mockGroup = {
                ...mockGroups[0],
                ownerId: mockUser.id,
                ownerSummary: buildMockUserSummary(mockUser, false),
            };
            renderTestEnvironment({
                role: "TUTOR",
                extraEndpoints: [
                    rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup]))
                ]
            });
            await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
            const groups = await switchGroupsTab(activeOrArchived, [mockGroup]);
            const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
            await userEvent.click(selectGroupButton);
            const groupEditor = await screen.findByTestId("group-editor");
            // Neither variant of the button should show
            const addManagersButton = within(groupEditor).queryByRole("button", {name: "Add / remove group managers"});
            const viewManagersButton = within(groupEditor).queryByRole("button", {name: "View all group managers"});
            expect(addManagersButton).toBeNull();
            expect(viewManagersButton).toBeNull();
        });
    });

    it(`allows teacher owners of a group to request password resets for group members that have allowed full access`, async () => {
        const mockGroup = {
            ...mockGroups[0],
            ownerId: mockUser.id,
            ownerSummary: buildMockUserSummary(mockUser, false),
        };
        let passwordResetSuccessfullySent = false;
        renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                // Group members consist of one student who has authorised full access, and one student that hasn't
                rest.get(API_PATH + `/groups/${mockGroup.id}/membership`, buildGroupMembershipsHandler([
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(10), mockGroup.id, true),
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(11), mockGroup.id, false)
                ])),
                rest.post(API_PATH + `/users/10/resetpassword`, (req, res, ctx) => {
                    passwordResetSuccessfullySent = true;
                    return res(ctx.status(200));
                })
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const groups = await switchGroupsTab("active", [mockGroup]);
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");
        // Expect that both members are shown
        const memberInfos = await within(groupEditor).findAllByTestId("member-info");
        expect(memberInfos).toHaveLength(2);
        const resetPasswordButton1 = within(memberInfos[0]).getByRole("button", {name: "Reset Password"});
        // First button should work, because student has authorised full access
        expect(resetPasswordButton1).not.toBeDisabled();
        // CAUTION - We can't use `userEvent.click` here because of the tooltip on this button. It crashes tests after
        // this because the document gets removed from underneath it before it can fade out, so we need to test this button
        // in a way that doesn't show the popup in the first place.
        resetPasswordButton1.click();
        await waitFor(() => {
            expect(passwordResetSuccessfullySent).toBeTruthy();
        });
        // Second button should be disabled
        const resetPasswordButton2 = within(memberInfos[1]).getByRole("button", {name: "Reset Password"});
        expect(resetPasswordButton2).toBeDisabled();
    });

    it(`doesn't allow tutor owners of a group to request a password reset for any group member`, async () => {
        const mockGroup = {
            ...mockGroups[0],
            ownerId: mockUser.id,
            ownerSummary: buildMockUserSummary(mockUser, false),
        };
        renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                // Group members consist of one student who has authorised full access, and one student that hasn't
                rest.get(API_PATH + `/groups/${mockGroup.id}/membership`, buildGroupMembershipsHandler([
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(10), mockGroup.id, true),
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(11), mockGroup.id, false)
                ]))
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const groups = await switchGroupsTab("active", [mockGroup]);
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = screen.getByTestId("group-editor")
        // Expect that both members are shown
        const memberInfos = await within(groupEditor).findAllByTestId("member-info");
        expect(memberInfos).toHaveLength(2);
        const resetPasswordButton1 = within(memberInfos[0]).queryByRole("button", {name: "Reset Password"});
        const resetPasswordButton2 = within(memberInfos[1]).queryByRole("button", {name: "Reset Password"});
        expect(resetPasswordButton1).toBeNull();
        expect(resetPasswordButton2).toBeNull();
    });

    it("allows teachers to add new group managers in the modal after creating a new group", async () => {
        const mockNewGroup = {
            id: 42,
            groupName: "new group",
            ownerId: mockUser.id,
            created: Date.now(),
            lastUpdated: Date.now(),
            ownerSummary: buildMockUserSummary(mockUser, false),
            archived: false
        };
        const mockNewManager = buildMockTeacher(2);
        const newGroupManagerHandler = buildNewManagerHandler(mockNewGroup, mockNewManager);
        renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                rest.post(API_PATH + "/groups", buildNewGroupHandler(mockNewGroup)),
                rest.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, buildAuthTokenHandler(mockNewGroup, "G3N30M")),
                rest.post(API_PATH + `/groups/${mockNewGroup.id}/manager`, newGroupManagerHandler)
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = await screen.findByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        const firstModal = await screen.findByTestId("active-modal");
        // Expect the "add group managers" button to be shown on the modal
        const addGroupManagersButton = await within(firstModal).findByRole("button", {name: "Add group managers"});
        await userEvent.click(addGroupManagersButton);
        await waitFor(()=>testAddAdditionalManagerInModal(newGroupManagerHandler, mockNewManager));
    });

    it("does not allow tutors to add new group managers in the modal after creating a new group", async () => {
        const mockNewGroup = {
            id: 42,
            groupName: "new group",
            ownerId: mockUser.id,
            created: Date.now(),
            lastUpdated: Date.now(),
            ownerSummary: buildMockUserSummary(mockUser, false),
            archived: false
        };
        renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                rest.post(API_PATH + "/groups", buildNewGroupHandler(mockNewGroup)),
                rest.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, buildAuthTokenHandler(mockNewGroup, "G3N30M"))
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const newGroupInput = await screen.findByPlaceholderText(/Group [Nn]ame/);
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = screen.getByRole("button", {name: "Create"});
        await userEvent.click(createButton);
        await waitFor(()=>{const firstModal = screen.getByTestId("active-modal");
        // Expect the "add group managers" button NOT to be shown on the modal
        expect(firstModal).toHaveModalTitle("Group Created");
        expect(within(firstModal).queryByRole("button", {name: "Add group managers"})).toBeNull()});
    });

    it("only allows additional group managers to remove themselves as group managers", async () => {
        const mockOwner = buildMockTeacher(2);
        const mockOtherManager = buildMockTeacher(3);
        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockOwner.id,
            ownerSummary: buildMockUserSummary(mockOwner, true),
            additionalManagers: [buildMockUserSummary(mockUser, true), buildMockUserSummary(mockOtherManager, true)]
        };
        const removeSelfAsManagerHandler = jest.fn((req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    ...mockGroup,
                    additionalManagers: mockGroup.additionalManagers.filter(m => m.id !== mockUser.id)
                })
            );
        });
        renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                rest.delete(API_PATH + "/groups/:groupId/manager/:userId", removeSelfAsManagerHandler)
            ]
        });
        await followHeaderNavLink("Teach", siteSpecific("Manage Groups", "Manage groups"));
        const groups = await switchGroupsTab("active", [mockGroup]);

        // Select group of interest
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");

        // Text on button should have changed to "View all" rather than "Add / remove"
        const addManagersButton = within(groupEditor).getByRole("button", {name: "View all group managers"});

        await userEvent.click(addManagersButton);

        // Find group manager modal, should have title "Shared group" instead of "Share your group"
        const groupManagersModal = await screen.findByTestId("active-modal");
        expect(groupManagersModal).toHaveModalTitle("Shared group");
        // Ensure owner is correct
        const ownerElement = within(groupManagersModal).getByTestId("group-owner");
        expect(ownerElement).toHaveTextContent(mockOwner.email);
        // Check that we can remove ourselves as an additional manager, but not any other managers
        const additionalManagerElements = within(groupManagersModal).getAllByTestId("group-manager");
        expect(additionalManagerElements).toHaveLength(2);

        // Make sure that we cannot add any more members ourselves
        const addManagerInput = within(groupManagersModal).queryByPlaceholderText("Enter email address here");
        expect(addManagerInput).toBeNull();
        const addManagerButton = within(groupManagersModal).queryByRole("button", {name: "Add group manager"});
        expect(addManagerButton).toBeNull();

        // "Remove" button should not be visible for the other additional manager
        const otherManagerElement = additionalManagerElements.find(e => e.textContent?.includes(mockOtherManager.email));
        if (!otherManagerElement) fail("Other additional manager not shown on modal, cannot continue test!");
        const otherRemoveButton = within(otherManagerElement as HTMLElement).queryByRole("button", {name: "Remove", hidden: false});
        expect(otherRemoveButton).toBeNull();

        // "Remove" button should be visible and work as expected for us (mock user)
        const selfManagerElement = additionalManagerElements.find(e => e.textContent?.includes(mockUser.email));
        if (!selfManagerElement) fail("Mock users additional manager entry not shown on modal, cannot continue test!");
        const selfRemoveButton = within(selfManagerElement as HTMLElement).getByRole("button", {name: "Remove", hidden: false});
        expect(selfRemoveButton).toBeVisible();
        await userEvent.click(selfRemoveButton as HTMLElement);
        let selfRemovalModal: HTMLElement | undefined;
        await waitFor(() => {
            selfRemovalModal = screen.getByTestId("active-modal");
            expect(selfRemovalModal).toHaveModalTitle("Remove yourself as a group manager");
        });
        const removeSelfButton = within(selfRemovalModal as HTMLElement).getByRole("button", {name: "Confirm"});
        await userEvent.click(removeSelfButton);

        // Expect that the API request to remove ourselves as the manager has been made...
        await waitFor(() => {
            expect(removeSelfAsManagerHandler).toHaveBeenRequestedWith((req) => {
                const {groupId, userId} = req.params;
                return parseInt(groupId as string) === mockGroup.id && parseInt(userId as string) === mockUser.id;
            });
        });
        // ... and for both modals to be closed
        await waitFor(() => {
            expect(selfRemovalModal).not.toBeInTheDocument();
            expect(groupManagersModal).not.toBeInTheDocument();
        });

        // Assert that the group we removed ourself from is no longer in our list
        await waitFor(() => {
            expect(selectGroupButton).not.toBeInTheDocument();
        });
    });
});
