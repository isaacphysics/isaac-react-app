import { rest } from "msw";
import { ACCOUNT_TAB, API_PATH, extractTeacherName, siteSpecific } from "../../app/services";
import {
    mockActiveGroups,
    buildMockTeacher,
    buildMockUserSummary} from "../../mocks/data";
import { followHeaderNavLink, renderTestEnvironment, switchAccountTab } from "../utils";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";

describe("My Account", () => {
    it("students can join a group by entering a group code", async () => {
        const mockTeacher = buildMockTeacher(2);
        const mockToken = "3GGD0G";

        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockTeacher.id,
            ownerSummary: buildMockUserSummary(mockTeacher, false),
            additionalManagers: [],
            members: [],
        };

        let joinedGroup = false;

        const getAuthorisationsHandler = jest.fn(async (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json(joinedGroup ? [mockTeacher] : [])
            );
        });

        const getGroupOwnerHandler = jest.fn(async (req, res, ctx) => {
            const token = req.params.token;
            if (token !== mockToken) return res(ctx.status(400));

            return res(
                ctx.status(200),
                ctx.json([buildMockUserSummary(mockTeacher, false)])
            );
        });

        const joinGroupHandler = jest.fn(async (req, res, ctx) => {
            const token = req.params.token;
            if (token !== mockToken) return res(ctx.status(400));

            joinedGroup = true;

            return res(
                ctx.status(200),
                ctx.json({
                    result: "success",
                })
            );
        });

        const membershipHandler = jest.fn(async (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json(joinedGroup ? [{
                    "group": mockGroup,
                    "membershipStatus": "ACTIVE",
                }] : [])
            );
        });

        renderTestEnvironment({
            role: "STUDENT",
            extraEndpoints: [
                rest.get(API_PATH + `/authorisations/token/:token/owner`, getGroupOwnerHandler),
                rest.get(API_PATH + "/authorisations", getAuthorisationsHandler),
                rest.post(API_PATH + `/authorisations/use_token/:token`, joinGroupHandler),
                rest.get(API_PATH + "/groups/membership", membershipHandler),
            ]
        });

        // Navigate to the teacher connections tab
        await followHeaderNavLink("My Isaac", siteSpecific("My Account", "My account"));
        await switchAccountTab(ACCOUNT_TAB.teacherconnections);
        // Enter the group code and connect
        const teacherConnectForm = await screen.findByTestId("teacher-connect-form");
        const codeEntryInput = await within(teacherConnectForm).findByPlaceholderText("Enter your code in here");
        await userEvent.type(codeEntryInput, mockToken);
        const connectButton = await within(teacherConnectForm).findByRole("button", {name: "Connect"});
        await userEvent.click(connectButton);

        // Check that the group owner was retrieved
        expect(getGroupOwnerHandler).toHaveBeenCalledTimes(1);

        // Wait for the modal to appear
        const dataSharingModal = await screen.findByTestId("active-modal");
            
        // Check that the data sharing modal is displayed
        expect(dataSharingModal).toHaveModalTitle("Sharing your data");

        // Join the group
        const joinButton = await within(dataSharingModal).findByRole("button", {name: "Confirm"});
        await userEvent.click(joinButton);

        // Check that the group was joined
        await waitFor(() => {
            expect(joinGroupHandler).toHaveBeenCalledTimes(1);
            expect(getAuthorisationsHandler).toHaveBeenCalledTimes(2);
        });
        
        // Assert that the teacher is now displayed in the group list
        const teacherConnectionsList = await screen.findByTestId("teacher-connections");

        const teacherName = extractTeacherName(mockTeacher);
        await within(teacherConnectionsList).findByText(teacherName as string);
    });

    it("student can revoke connection access to a teacher", async () => {

        const mockTeacher = buildMockTeacher(2);
        const mockTeacher2 = buildMockTeacher(3);
        const mockToken = "3GGD0G";

        const mockGroup = {
            ...mockActiveGroups[0],
            ownerId: mockTeacher.id,
            ownerSummary: buildMockUserSummary(mockTeacher, false),
            additionalManagers: [],
            members: [],
        };

        const getAuthorisationsHandler = jest.fn(async (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json([mockTeacher, mockTeacher2])
            );
        });

        const getGroupOwnerHandler = jest.fn(async (req, res, ctx) => {
            const token = req.params.token;
            if (token !== mockToken) return res(ctx.status(400));

            return res(
                ctx.status(200),
                ctx.json([buildMockUserSummary(mockTeacher, false)])
            );
        });

        const membershipHandler = jest.fn(async (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json([{
                    "group": mockGroup,
                    "membershipStatus": "ACTIVE",
                }])
            );
        });

        const getOtherUserAuthorisationsHandler = jest.fn(async (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json([])
            );
        });

        const deleteAuthorisationHandler = jest.fn(async (req, res, ctx) => {
            const id = req.params.id;
            if (id !== mockTeacher.id) return res(ctx.status(400));

            return res(
                ctx.status(204),
                ctx.json({
                    result: "success",
                })
            );
        });

        renderTestEnvironment({
            role: "STUDENT",
            extraEndpoints: [
                rest.get(API_PATH + `/authorisations/token/:token/owner`, getGroupOwnerHandler),
                rest.get(API_PATH + "/authorisations", getAuthorisationsHandler),
                rest.get(API_PATH + "/groups/membership", membershipHandler),
                rest.get(API_PATH + "/authorisations/other_users", getOtherUserAuthorisationsHandler),
                rest.delete(API_PATH + "/authorisations/:id", deleteAuthorisationHandler),
            ]
        });

        // Navigate to the teacher connections tab
        await followHeaderNavLink("My Isaac", siteSpecific("My Account", "My account"));
        await switchAccountTab(ACCOUNT_TAB.teacherconnections);

        // Check that the teacher is displayed in the list of teacher connections
        const teacherConnectionsList = await screen.findByTestId("teacher-connections");
        const teacherName = extractTeacherName(mockTeacher);
        const teacherNameSpan = await within(teacherConnectionsList).findByText(teacherName as string);

        const teacherSpan = teacherNameSpan.parentElement;
        expect(teacherSpan).toBeInTheDocument();

        const teacherRevokeButton = await within(teacherSpan as HTMLElement).findByRole("button", {name: "Revoke"});

        // Revoke the connection
        await userEvent.click(teacherRevokeButton);

        const confirmationModal = await screen.findByTestId("active-modal");
        expect(confirmationModal).toHaveModalTitle("Revoke access to your data");
        expect(confirmationModal).toContainHTML(teacherName as string);

        const confirmButton = await within(confirmationModal).findByRole("button", {name: "Confirm"});
        await userEvent.click(confirmButton);

        // Check that the connection was revoked

        await waitFor(() => {
            expect(getAuthorisationsHandler).toHaveBeenCalledTimes(2);
        });

    });
});