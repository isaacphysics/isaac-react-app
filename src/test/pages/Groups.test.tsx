import {screen, waitFor, within} from "@testing-library/react";
import {navigateToGroups, navigateToMyAccount, renderTestEnvironment, switchAccountTab} from "../testUtils";
import {
    buildMockStudent,
    buildMockTeacher,
    buildMockUserSummary,
    buildMockUserSummaryWithGroupMembership,
    mockActiveGroups,
    mockArchivedGroups,
    mockGroups,
    mockUser
} from "../../mocks/data";
import {ACCOUNT_TAB, API_PATH, extractTeacherName, isDefined, siteSpecific} from "../../app/services";
import difference from "lodash/difference";
import isEqual from "lodash/isEqual";
import userEvent from "@testing-library/user-event";
import {DefaultRequestMultipartBody, HttpResponse, ResponseResolver, http} from "msw";
import {
    buildAuthTokenHandler,
    buildGroupHandler,
    buildNewManagerHandler,
    handlerThatReturns
} from "../../mocks/handlers";
import queryString from "query-string";
import { HttpRequestArguments } from "../matchers";

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

const closeActiveModal = async (modal: HTMLElement) => {
    // Close the modal
    const closeButton = within(modal).getByTestId("active-modal-close");
    await userEvent.click(closeButton);
    await waitFor(() => {
        expect(modal).not.toBeInTheDocument();
    });
};

// Reusable test for adding a manager in the additional manager modal
const testAddAdditionalManagerInModal = async (managerHandler: ResponseResolver, newManager: any, isOwner: boolean) => {
    let groupManagersModal: HTMLElement | undefined;
    await waitFor(() => {
        groupManagersModal = screen.getByTestId("active-modal");
        expect(groupManagersModal).toHaveModalTitle(isOwner ? "Share your group" : "Shared group");
    });
    if (!groupManagersModal) fail(); // Shouldn't happen because of the above `waitFor`

    // Check how many managers are shown initially for comparison afterwards
    const initialManagerCount = within(groupManagersModal).queryAllByTestId("group-manager").length;

    const addManagerInput = within(groupManagersModal).getByPlaceholderText("Enter email address here");
    await userEvent.type(addManagerInput, newManager.email);
    const addManagerButton = within(groupManagersModal).getByRole("button", {name: "Add group manager"});
    await userEvent.click(addManagerButton);
    // Expect correct email was sent in request
    await waitFor(() => {
        expect(managerHandler).toHaveBeenCalledTimes(1);
    });
    await expect(managerHandler).toHaveBeenRequestedWith(async ({request}) => {
        const { email } = await request.json().then(data => data as Record<string, string>);
        return email === newManager.email;
    });
    // Expect that new additional manager is shown in modal
    const managerElements = within(groupManagersModal as HTMLElement).queryAllByTestId("group-manager");
    await waitFor(() => {
        expect(managerElements).toHaveLength(initialManagerCount + 1);
        expect(managerElements.some(e => e.textContent.includes(newManager.email))).toBeTruthy();

    });

    const actionsExist = within(managerElements[0]).queryByRole("button", {name: "Actions"}) !== null;
    // at md, the actions button appears instead; since this is different per site, actionsExist is used to determine which variant to test
    if (!actionsExist) {
        // User should be able to see the remove button, since they are the owner
        const removeButton = within(managerElements[0]).getByRole("button", {name: "Remove"});
        expect(removeButton).toBeVisible();
    } else {
        // The available space is narrower on Ada so the remove button is inside a dropdown
        const actionsButton = within(managerElements[0]).getByRole("button", {name: "Actions"});
        await userEvent.click(actionsButton);
        const removeButton = await screen.findByRole("menuitem", {name: "Remove"});
        expect(removeButton).toBeVisible();
    }
    await closeActiveModal(groupManagersModal);
};

describe("Groups", () => {

    (["TUTOR", "TEACHER"] as const).forEach(role => it(`displays all active groups on load if the user is a ${role.toLowerCase()}, and all archived groups when Archived tab is clicked`, async () => {
        await renderTestEnvironment({role});
        await navigateToGroups();
        // switchGroupsTab checks that the mock active groups we expect to be there are in fact there
        await switchGroupsTab("active", mockActiveGroups);
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
    }));

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
        const newGroupHandler = handlerThatReturns({data: mockNewGroup});
        const authTokenHandler = buildAuthTokenHandler(mockNewGroup, mockToken);
        await renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                http.post(API_PATH + "/groups", newGroupHandler),
                http.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, authTokenHandler),
            ]
        });

        await navigateToGroups();

        const create = await screen.findByRole("button", {name: "Create a new group"});
        await userEvent.click(create);

        await screen.findByTestId("active-modal");
        const newGroupInput = await screen.findByTestId("group-name-input");
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = await screen.findByRole("button", {name: "Create group"});
        await userEvent.click(createButton);

        // Expect that the new group POST request is made exactly once
        await waitFor(() => {
            expect(newGroupHandler).toHaveBeenCalledTimes(1);
        });
        await expect(newGroupHandler).toHaveBeenRequestedWith(async ({request}) => {
            const body = await request.json() as Record<string, any> | DefaultRequestMultipartBody;
            return "groupName" in body && body.groupName === mockNewGroup.groupName;
        });
        const modal = await screen.findByTestId("active-modal");
        // Expect that the auth token GET request is made exactly once
        await waitFor(() => {
            expect(modal).toHaveModalTitle("Group created");
            expect(authTokenHandler).toHaveBeenCalledTimes(1);
        });
        // Expect the share link and share code to be shown on the modal
        const link = await within(modal).findByTestId("share-link");
        const code = await within(modal).findByTestId("share-code");
        expect(link).toHaveAttribute('value', expect.stringContaining(`/account?authToken=${mockToken}`));
        expect(code).toHaveAttribute('value', expect.stringMatching(mockToken));
        await closeActiveModal(modal);
    });

    it(`allows you to delete archived groups`, async () => {
        const groupToDelete = mockArchivedGroups[0];
        let correctDeleteRequests = 0;
        await renderTestEnvironment({
            extraEndpoints: [
                http.delete(API_PATH + "/groups/:groupId", async ({params}) => {
                    const {groupId} = params;
                    if (parseInt(groupId as string) === groupToDelete.id) {
                        correctDeleteRequests++;
                    }
                    return new HttpResponse(null, {status: 204,});
                }),
            ]
        });
        await navigateToGroups();
        const groups = await switchGroupsTab("archived", mockArchivedGroups);
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

    (["active", "archived"] as const).forEach((activeOrArchived) => {
        const mockGroups = activeOrArchived === "active" ? mockActiveGroups : mockArchivedGroups;
        const mockOtherGroups = activeOrArchived === "active" ? mockArchivedGroups : mockActiveGroups;

        it(`allows you to rename ${activeOrArchived} groups`, async () => {
            const groupToRename = mockGroups[0];
            const newGroupName = "Test Group Renamed";
            let correctUpdateRequests = 0;
            await renderTestEnvironment({
                extraEndpoints: [
                    http.post(API_PATH + "/groups/:groupId", async ({request, params}) => {
                        const {groupId} = params;
                        const updatedGroup = await request.json() as Record<string, string> | DefaultRequestMultipartBody;
                        if (parseInt(groupId as string) === groupToRename.id && updatedGroup?.groupName === newGroupName && isEqual(groupToRename, {...updatedGroup, groupName: groupToRename.groupName})) {
                            correctUpdateRequests++;
                        }
                        return new HttpResponse(null, {status: 204,});
                    }),
                ]
            });
            await navigateToGroups();
            const groups = await switchGroupsTab(activeOrArchived, mockGroups);
            const groupNames = groups.map(e => within(e).getByTestId("select-group").textContent);
            const groupToRenameElement = groups.find(e => within(e).getByTestId("select-group").textContent === groupToRename.groupName) as HTMLElement;
            expect(groupToRenameElement).toBeDefined();
            // Open group editor for group to rename
            await userEvent.click(within(groupToRenameElement).getByTestId("select-group"));
            // Wait for "Manage group" panel to be open
            const groupEditor = await screen.findByTestId("group-editor");
            await waitFor(async () => {
                await within(groupEditor).findByText(siteSpecific("Manage group", "Group details"));
            });
            // Rename the group and click update
            const groupNameInput = await within(groupEditor).findByTestId("groupName");
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
                const updateGroup = jest.fn(async () => {
                    return HttpResponse.json({...groupToModify, archived: newArchivedValue}, {
                        status: 200,
                    });
                });
                const getGroups = jest.fn(({request} : HttpRequestArguments) => {
                    const url = new URL(request.url);
                    const archived = url.searchParams.get("archived_groups_only") === "true";
                    const groups = archived === newArchivedValue ? (shouldTryToShowArchivedTabFirst ? mockOtherGroups : [...mockOtherGroups, {
                        ...groupToModify,
                        archived: newArchivedValue
                    }]) : mockGroups;
                    return HttpResponse.json(groups, {
                        status: 200,
                    });
                });
                await renderTestEnvironment({
                    extraEndpoints: [
                        http.post(API_PATH + "/groups/:groupId", updateGroup),
                        // We need to handle when the Archived tab requests the list of archived groups, because in this case
                        // the optimistic update to the archived list falls flat - RTKQ cache updates can only occur if the
                        // cache entry exists, but in this test the archived tab only gets visited for the first time AFTER
                        // we try to update the cache.
                        // If RTKQ cache gets an "upsert" function, then we can use that instead, and the below request handler
                        // can be removed.
                        // http.get(API_PATH + "/groups", getGroups)

                        http.get(API_PATH + "/groups", getGroups as any)
                    ]
                });
                await navigateToGroups();
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
                const archiveButton = await within(groupEditor).findByRole("button", {name: `${activeOrArchived === "active" ? "A" : "Una"}rchive group`});
                await userEvent.click(archiveButton);
                if (activeOrArchived === "active") {
                    const modal = await screen.findByTestId("active-modal");
                    await waitFor(() => {
                        expect(modal).toHaveModalTitle("Archive group");
                    });
                    const confirmButton = within(modal).getByRole("button", {name: "Archive"});
                    await userEvent.click(confirmButton);
                }
                // Assert that the request was called, and the modified group no longer exists in the initial list of groups
                await waitFor(() => {
                    expect(updateGroup).toHaveBeenCalledTimes(1);
                    const newGroupNames = screen.queryAllByTestId("group-item").map(e => within(e).getByTestId("select-group").textContent);
                    expect(newGroupNames).not.toContain(groupToModifyName);
                    expect(newGroupNames).toHaveLength(groups.length - 1);
                });
                // Assert that the request was what we expected
                await expect(updateGroup).toHaveBeenRequestedWith(async ({request, params}) => {
                    const {groupId} = params;
                    const updatedGroup = await request.json() as Record<string, any> | DefaultRequestMultipartBody;
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
                await expect(getGroups).toHaveBeenRequestedWith(({request}) => {
                    const url = new URL(request.url);
                    return url.searchParams.get("archived_groups_only") === "true";
                });
                await expect(getGroups).toHaveBeenRequestedWith(({request}) => {
                    const url = new URL(request.url);
                    return url.searchParams.get("archived_groups_only") === "false";
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
            await renderTestEnvironment({
                role: "TEACHER",
                extraEndpoints: [
                    http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                    http.post(API_PATH + `/groups/${mockGroup.id}/manager`, existingGroupManagerHandler)
                ]
            });
            await navigateToGroups();
            const groups = await switchGroupsTab(activeOrArchived, [mockGroup]);
            const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
            await userEvent.click(selectGroupButton);
            const groupEditor = await screen.findByTestId("group-editor");
            const addManagersButton = within(groupEditor).getByRole("button", {name: "Add group managers"});
            await userEvent.click(addManagersButton);
            await testAddAdditionalManagerInModal(existingGroupManagerHandler, mockNewManager, true);
        });

        it(`does not allow tutor owners of a group to add new group managers to an existing ${activeOrArchived} group`, async () => {
            const mockGroup = {
                ...mockGroups[0],
                ownerId: mockUser.id,
                ownerSummary: buildMockUserSummary(mockUser, false),
            };
            await renderTestEnvironment({
                role: "TUTOR",
                extraEndpoints: [
                    http.get(API_PATH + "/groups", buildGroupHandler([mockGroup]))
                ]
            });
            await navigateToGroups();
            const groups = await switchGroupsTab(activeOrArchived, [mockGroup]);
            const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
            await userEvent.click(selectGroupButton);
            const groupEditor = await screen.findByTestId("group-editor");
            // Neither variant of the button should show
            const addManagersButton = within(groupEditor).queryByRole("button", {name: "Add group managers"});
            const viewManagersButton = within(groupEditor).queryByRole("button", {name: "More information"});
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
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                // Group members consist of one student who has authorised full access, and one student that hasn't
                http.get(API_PATH + `/groups/${mockGroup.id}/membership`, handlerThatReturns({data: [
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(10), mockGroup.id, true),
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(11), mockGroup.id, false)
                ]})),
                http.post(API_PATH + `/users/10/resetpassword`, () => {
                    passwordResetSuccessfullySent = true;
                    return HttpResponse.json(null, {
                        status: 200,
                    });
                })
            ]
        });
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");
        // Expect that both members are shown
        const memberInfos = await within(groupEditor).findAllByTestId("member-info");
        expect(memberInfos).toHaveLength(2);
        const resetPasswordButton1 = within(memberInfos[0]).getByRole("button", {name: "Reset password"});
        // First button should work, because student has authorised full access
        expect(resetPasswordButton1).not.toBeDisabled();
        // CAUTION - We can't use `userEvent.click` here because of the tooltip on this button. It crashes tests after
        // this because the document gets removed from underneath it before it can fade out, so we need to test this button
        // in a way that doesn't show the popup in the first place.
        resetPasswordButton1.click();
        waitFor(() => {
            expect(passwordResetSuccessfullySent).toBeTruthy();
        });
        // Second button should be disabled
        const resetPasswordButton2 = within(memberInfos[1]).getByRole("button", {name: "Reset password"});
        expect(resetPasswordButton2).toBeDisabled();
    });

    it(`doesn't allow tutor owners of a group to request a password reset for any group member`, async () => {
        const mockGroup = {
            ...mockGroups[0],
            ownerId: mockUser.id,
            ownerSummary: buildMockUserSummary(mockUser, false),
        };
        await renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                // Group members consist of one student who has authorised full access, and one student that hasn't
                http.get(API_PATH + `/groups/${mockGroup.id}/membership`, handlerThatReturns({data: [
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(10), mockGroup.id, true),
                    buildMockUserSummaryWithGroupMembership(buildMockStudent(11), mockGroup.id, false)
                ]}))
            ]
        });
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");
        // Expect that both members are shown
        const memberInfos = await within(groupEditor).findAllByTestId("member-info");
        expect(memberInfos).toHaveLength(2);
        const resetPasswordButton1 = within(memberInfos[0]).queryByRole("button", {name: "Reset password"});
        const resetPasswordButton2 = within(memberInfos[1]).queryByRole("button", {name: "Reset password"});
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
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.post(API_PATH + "/groups", handlerThatReturns({data: mockNewGroup})),
                http.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, buildAuthTokenHandler(mockNewGroup, "G3N30M")),
                http.post(API_PATH + `/groups/${mockNewGroup.id}/manager`, newGroupManagerHandler)
            ]
        });
        await navigateToGroups();

        const create = await screen.findByRole("button", {name: "Create a new group"});
        await userEvent.click(create);

        await screen.findByTestId("active-modal");
        const newGroupInput = await screen.findByTestId("group-name-input");
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = await screen.findByRole("button", {name: "Create group"});
        await userEvent.click(createButton);

        const inviteModal = await screen.findByTestId("active-modal");

        // Expect the "add group managers" button to be shown on the modal
        const addGroupManagersButton = await within(inviteModal).findByRole("button", {name: "Add group managers"});
        await userEvent.click(addGroupManagersButton);
        await testAddAdditionalManagerInModal(newGroupManagerHandler, mockNewManager, true);
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
        await renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                http.post(API_PATH + "/groups", handlerThatReturns({data: mockNewGroup})),
                http.get(API_PATH + `/authorisations/token/${mockNewGroup.id}`, buildAuthTokenHandler(mockNewGroup, "G3N30M"))
            ]
        });
        await navigateToGroups();

        const create = await screen.findByRole("button", {name: "Create a new group"});
        await userEvent.click(create);

        await screen.findByTestId("active-modal");
        const newGroupInput = await screen.findByTestId("group-name-input");
        await userEvent.type(newGroupInput, mockNewGroup.groupName);
        const createButton = await screen.findByRole("button", {name: "Create group"});
        await userEvent.click(createButton);

        const inviteModal = await screen.findByTestId("active-modal");

        // Expect the "add group managers" button NOT to be shown on the modal
        expect(inviteModal).toHaveModalTitle("Group created");
        expect(within(inviteModal).queryByRole("button", {name: "Add group managers"})).toBeNull();
        await closeActiveModal(inviteModal);
    });

    it("only allows additional group managers without privileges to remove themselves as group managers", async () => {
        const mockOwner = buildMockTeacher(2);
        const mockOtherManager = buildMockTeacher(3);
        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockOwner.id,
            ownerSummary: buildMockUserSummary(mockOwner, true),
            additionalManagers: [buildMockUserSummary(mockUser, true), buildMockUserSummary(mockOtherManager, true)],
            additionalManagerPrivileges: false,
        };
        const removeSelfAsManagerHandler = jest.fn(() => {
            return HttpResponse.json({
                ...mockGroup,
                additionalManagers: mockGroup.additionalManagers.filter(m => m.id !== mockUser.id)
            }, {
                status: 200,
            });
        });
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.delete(API_PATH + "/groups/:groupId/manager/:userId", removeSelfAsManagerHandler)
            ]
        });
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);

        // Select group of interest
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");

        // Text on button should have changed to "More info" rather than "Add / remove"
        const addManagersButton = within(groupEditor).getByRole("button", {name: /More info\s?rmation/});

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

    (["with", "without"] as const).forEach(async (permission) => {it(`${permission === "with" ? "allows" : "does not allow"} additional group managers ${permission} privileges to add and remove other managers`, async () => {
        const mockOwner = buildMockTeacher(2);
        const mockAdditionalManager = buildMockTeacher(3);
        const mockNewManager = buildMockTeacher(4);
        const additionalManagerPrivileges = permission === "with";

        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockOwner.id,
            additionalManagers: [buildMockUserSummary(mockAdditionalManager, true)],
            additionalManagerPrivileges: additionalManagerPrivileges,
        };

        const existingGroupManagerHandler = buildNewManagerHandler(mockGroup, mockNewManager);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const removeAdditionalManagerHandler = (managerToRemove: any) => jest.fn(() => {
            return HttpResponse.json({
                ...mockGroup,
                additionalManagers: mockGroup.additionalManagers.filter(m => m.id !== managerToRemove.id)
            }, {
                status: 200,
            });
        });

        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.post(API_PATH + `/groups/${mockGroup.id}/manager`, existingGroupManagerHandler),
                http.delete(API_PATH + "/groups/:groupId/manager/:userId", removeAdditionalManagerHandler(mockNewManager))
            ]
        });

        // Select group and check for "Edit group managers" button
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");
        const editManagersButton = within(groupEditor).queryByRole("button", {name: "Edit group managers"});

        if (!additionalManagerPrivileges) {
            expect(editManagersButton).toBeNull();
        } else {
            // Add a new manager
            expect(editManagersButton).toBeVisible();
            await userEvent.click(editManagersButton!);
            await testAddAdditionalManagerInModal(existingGroupManagerHandler, mockNewManager, false);

            // Remove the manager that was just added
            await userEvent.click(editManagersButton!);
            const groupManagersModal = await screen.findByTestId("active-modal");
            const additionalManagerElements = within(groupManagersModal).getAllByTestId("group-manager");
            const initialManagerCount = additionalManagerElements.length;
            const managerToRemove = additionalManagerElements.find(e => e.textContent?.includes(mockNewManager.email));
            const removeButton = within(managerToRemove as HTMLElement).getByRole("button", {name: "Remove", hidden: false});
            await userEvent.click(removeButton);
            expect(window.confirm).toHaveBeenCalled();
            const newAdditionalManagerElements = within(groupManagersModal).getAllByTestId("group-manager");
            expect(newAdditionalManagerElements).toHaveLength(initialManagerCount - 1);
            expect(newAdditionalManagerElements.some(e => e.textContent.includes(mockNewManager.email))).toBeFalsy();
        }
    });});

    it("the shareable url for an existing group is shown when the invite button clicked", async () => {
        const mockToken = "ABCD234";
        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockUser.id,
            ownerSummary: buildMockUserSummary(mockUser, false),
        };
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.get(API_PATH + `/authorisations/token/${mockGroup.id}`, buildAuthTokenHandler(mockGroup, mockToken))
            ]
        });

        // Navigate to the groups page
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);

        // Select group of interest
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);

        const groupMembers = await screen.findAllByTestId("group-members");

        // Click "invite users"
        const inviteUsersButton = await within(groupMembers[0]).findByRole("button", {name: "Invite users"});
        await userEvent.click(inviteUsersButton);

        // Assert that the shareable url is shown and has the correct token
        const inviteUsersModal = await screen.findByTestId("active-modal");

        await waitFor(async () => {
            const shareLink = within(inviteUsersModal as HTMLElement).getByTestId("share-link");
            expect(shareLink).toHaveAttribute('value', expect.stringContaining(`/account?authToken=${mockToken}`));
        });

        await closeActiveModal(inviteUsersModal);

        await waitFor(() => {
            expect(inviteUsersModal).not.toBeInTheDocument();
        });
    });

    it("the shareable url for a group connects a student to the group", async () => {
        const mockToken = "ABCD234";

        const mockTeacher = buildMockTeacher(75);
        const mockManager = buildMockTeacher(76);

        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockTeacher.id,
            ownerSummary: [buildMockUserSummary(mockTeacher, false)],
            additionalManagers: [buildMockUserSummary(mockManager, false)]
        };

        let joinedGroup = false;

        const getAuthorisationsHandler = jest.fn(async () => {
            return HttpResponse.json(joinedGroup ? [mockTeacher, mockManager] : [], {
                status: 200,
            });
        });

        const getGroupOwnerHandler = jest.fn(async () => {
            return HttpResponse.json([...mockGroup.ownerSummary, ...mockGroup.additionalManagers.flat()], {
                status: 200,
            });
        });

        const joinGroupHandler = jest.fn(async ({params}) => {
            const { token } = params;
            if (token !== mockToken) return HttpResponse.json(null, {status: 400,});

            joinedGroup = true;

            return HttpResponse.json({result: "success"}, {
                status: 200,
            });
        });

        const membershipHandler = jest.fn(async () => {
            return HttpResponse.json(joinedGroup ? [{
                "group": mockGroup,
                "membershipStatus": "ACTIVE",
            }] : [], {
                status: 200,
            });
        });

        await renderTestEnvironment({
            role: "STUDENT",
            extraEndpoints: [
                http.get(API_PATH + `/authorisations/token/:token/owner`, getGroupOwnerHandler),
                http.get(API_PATH + "/authorisations", getAuthorisationsHandler),
                http.post(API_PATH + `/authorisations/use_token/:token`, joinGroupHandler),
                http.get(API_PATH + "/groups/membership", membershipHandler),
            ],
        });

        jest.spyOn(queryString, "parse").mockImplementation(() => ({authToken: mockToken}));

        await navigateToMyAccount();
        await switchAccountTab(ACCOUNT_TAB.teacherconnections);

        expect(joinGroupHandler).toHaveBeenCalledTimes(0);
        expect(getGroupOwnerHandler).toHaveBeenCalledTimes(1);
        expect(membershipHandler).toHaveBeenCalledTimes(1);
        expect(getAuthorisationsHandler).toHaveBeenCalledTimes(1);

        const modal = screen.getByTestId("active-modal");

        expect(modal).toHaveModalTitle("Sharing your data");
        const groupManagers = within(modal).getByRole("table");

        expect(groupManagers).toHaveTextContent(mockTeacher.email);
        expect(groupManagers).toHaveTextContent(mockManager.email);
        expect(groupManagers).toHaveTextContent(extractTeacherName(mockTeacher) ?? "");
        expect(groupManagers).toHaveTextContent(extractTeacherName(mockManager) ?? "");

        const joinGroupButton = within(modal).getByRole("button", {name: "Confirm"});
        await userEvent.click(joinGroupButton);

        await waitFor(() => {
            expect(joinGroupHandler).toHaveBeenCalledTimes(1);
            expect(membershipHandler).toHaveBeenCalledTimes(2);
            expect(getAuthorisationsHandler).toHaveBeenCalledTimes(2);
        });

        const teacherConnections = await screen.findByTestId("teacher-connections");

        await waitFor(() => {
            within(teacherConnections).getByText(extractTeacherName(mockTeacher) ?? "");
            within(teacherConnections).getByText(extractTeacherName(mockManager) ?? "");
        });

        await closeActiveModal(modal);

        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });
    });

    (["with", "without"] as const).forEach(async (permission) => {it(`are managers able to remove students from groups ${permission} the correct permissions`, async () => {
        const additionalManagerPrivileges = permission === "with";
        const mockOwner = buildMockTeacher(2);
        const mockStudent10 = buildMockStudent(10);
        const mockStudent11 = buildMockStudent(11);
        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockOwner.id,
            ownerSummary: buildMockUserSummary(mockOwner, true),
            additionalManagers: [buildMockUserSummary(mockUser, true)],
            members: [
                buildMockUserSummaryWithGroupMembership(mockStudent10, mockActiveGroups[0].id, true), 
                buildMockUserSummaryWithGroupMembership(mockStudent11, mockActiveGroups[0].id, false),
            ],
            additionalManagerPrivileges: additionalManagerPrivileges,
        };
        const removeStudentHandler = jest.fn(() => {
            return HttpResponse.json(null, {
                status: 200,
            });
        });
        const getGroupMembershipHandler = handlerThatReturns({data: mockGroup.members});
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.get(API_PATH + "/groups/:groupId/membership", getGroupMembershipHandler),
                http.delete(API_PATH + "/groups/:groupId/membership/:userId", removeStudentHandler),
            ]
        });
        await navigateToGroups();
        const groups = await switchGroupsTab("active", [mockGroup]);

        // Select group of interest
        const selectGroupButton = within(groups.find(g => within(g).getByTestId("select-group").textContent === mockGroup.groupName) as HTMLElement).getByTestId("select-group");
        await userEvent.click(selectGroupButton);
        const groupEditor = await screen.findByTestId("group-editor");

        // find all group members
        expect(getGroupMembershipHandler).toHaveBeenCalledTimes(1);
        const memberInfos = await within(groupEditor).findAllByTestId("member-info");

        expect(memberInfos).toHaveLength(2);
        memberInfos.forEach((memberInfo) => {
            expect(memberInfo.textContent).toMatch(
                new RegExp(String.raw`${mockStudent10.givenName}\s${mockStudent10.familyName}|${mockStudent11.givenName}\s${mockStudent11.familyName}`, "g")
            );
        });

        jest.spyOn(window, "confirm").mockImplementation(() => true);

        if (additionalManagerPrivileges) {
            // The remove button should be visible
            const student10Container = memberInfos.find((memberInfo) => memberInfo.textContent?.includes(mockStudent10.familyName)) as HTMLElement;
            const removeStudentButton = within(student10Container).getByRole("button", {name: "Remove member"});
            removeStudentButton.click();

            await waitFor(() => {
                expect(removeStudentHandler).toHaveBeenCalledTimes(1);
            });
        } else {
            // The remove button should not be visible
            const student10Container = memberInfos.find((memberInfo) => memberInfo.textContent?.includes(mockStudent10.familyName)) as HTMLElement;
            expect(within(student10Container).queryByRole("button", {name: "Remove member"})).not.toBeInTheDocument();
        }
    });
    });
});
