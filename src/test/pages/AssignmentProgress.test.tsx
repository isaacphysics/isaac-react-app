import {screen, waitFor, within} from "@testing-library/react";
import {navigateToAssignmentProgress, renderTestEnvironment} from "../testUtils";
import {API_PATH, utf8ByteLength} from "../../app/services";
import {mockActiveGroups, mockAssignmentsGroup2, mockQuizAssignments} from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import {buildGroupHandler} from "../../mocks/handlers";
import {http, HttpResponse} from "msw";

describe("AssignmentProgress", () => {

    it("shows an accordion section for each active group", async () => {
        await renderTestEnvironment({
            role: "TUTOR",
        });
        await navigateToAssignmentProgress();
        const groupTitles = await screen.findAllByTestId("group-name");
        expect(groupTitles).toHaveLength(mockActiveGroups.length);
    });

    it("shows both \"Assignments\" and \"Tests\" tabs to teachers", async () => {
        const mockGroup = mockActiveGroups[0];
        const mockAssignments = mockAssignmentsGroup2;
        const mockTestAssignments = mockQuizAssignments.filter(q => q.groupId === mockGroup.id);
        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.get(API_PATH + "/assignments/assign", ({request, params, cookies}) => {
                    return HttpResponse.json(mockAssignments, {
                        status: 200,
                    });
                }),
                http.get(API_PATH + "/quiz/assigned", ({request, params, cookies}) => {
                    return HttpResponse.json(mockTestAssignments, {
                        status: 200,
                    });
                })
            ]
        });
        await navigateToAssignmentProgress();
        // Should only be one group
        const groupTitle = await screen.findByTestId("group-name");
        // Clicking on the group title should suffice to open the accordion
        await userEvent.click(groupTitle);
        // Get the two tabs, making sure that they show the correct numbers of assignments in each one
        const assignmentsTab = await screen.findByRole("button", {name: `Assignments (${mockAssignments.length})`});
        const testsTab = await screen.findByRole("button", {name: `Tests (${mockTestAssignments.length})`});
        await userEvent.click(assignmentsTab);
        for (const assignmentTitle of mockAssignments.map(a => a.gameboard?.title)) {
            await screen.findByText(assignmentTitle, {exact: false});
        }
        await userEvent.click(testsTab);
        for (const testTitle of mockTestAssignments.map(q => q.quizSummary?.title)) {
            await screen.findByText(testTitle as string, {exact: false});
        }
    });

    it("only shows assignments to tutors, with only assignments tab shown", async () => {
        const mockGroup = mockActiveGroups[0];
        const mockAssignments = mockAssignmentsGroup2;
        const mockTestAssignments = mockQuizAssignments.filter(q => q.groupId === mockGroup.id);
        await renderTestEnvironment({
            role: "TUTOR",
            extraEndpoints: [
                http.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
                http.get(API_PATH + "/assignments/assign", ({request, params, cookies}) => {
                    return HttpResponse.json(mockAssignments, {
                        status: 200,
                    });
                }),
                http.get(API_PATH + "/quiz/assigned", ({request, params, cookies}) => {
                    return HttpResponse.json(mockTestAssignments, {
                        status: 200,
                    });
                })
            ]
        });
        await navigateToAssignmentProgress();
        // Should only be one group
        const groupTitle = await screen.findByTestId("group-name");
        // Clicking on the group title should suffice to open the accordion
        await userEvent.click(groupTitle);
        // Make sure that that tests tab button isn't shown
        const testsTab = screen.queryByRole("button", {name: `Tests (${mockTestAssignments.length})`});
        expect(testsTab).toBeNull();
        // Check that all assignments are showing
        for (const assignmentTitle of mockAssignments.map(a => a.gameboard?.title)) {
            await screen.findByText(assignmentTitle, {exact: false});
        }
    });

    it("allows teachers to download group assignment progress CSVs", async () => {
        // Arrange
        const mockData = "I'm a CSV";

        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/assignments/assign/group/2/progress/download", ({request, params, cookies}) => {
                    return HttpResponse.text(mockData, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/csv",
                            "Content-Length": utf8ByteLength(mockData).toString(),
                        }
                    });
                }),
            ]
        });
        await navigateToAssignmentProgress();
        const groupDownloadLinks = await screen.findAllByText("Download assignments CSV");

        // Act
        await userEvent.click(groupDownloadLinks[0]);

        // Assert
        // privacy modal is shown
        const modal = await screen.findByTestId("active-modal");
        expect(modal.textContent).toContain("Privacy Notice");
        // clicking "download" closes the modal
        await userEvent.click(within(modal).getByRole("link", {name: "Download CSV"}));
        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });
    });

    it("allows teachers to download individual assignment progress CSVs", async () => {
        // Arrange
        const mockData = "I'm a CSV";

        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/assignments/assign/2/progress/download", ({request, params, cookies}) => {
                    return HttpResponse.text(mockData, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/csv",
                            "Content-Length": utf8ByteLength(mockData).toString(),
                        }
                    });
                }),
            ]
        });
        await navigateToAssignmentProgress();

        const groupTitles = await screen.findAllByTestId("group-name");
        // Clicking on the group title should suffice to open the accordion
        await userEvent.click(groupTitles[0]);

        const assignmentDownloadLinks = await screen.findAllByText("Download CSV");

        // Act
        await userEvent.click(assignmentDownloadLinks[0]);

        // Assert
        // privacy modal is shown
        const modal = await screen.findByTestId("active-modal");
        expect(modal.textContent).toContain("Privacy Notice");
        // clicking "download" closes the modal
        await userEvent.click(within(modal).getByRole("link", {name: "Download CSV"}));
        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });
    });

    it("allows teachers to download group test progress CSVs", async () => {
        // Arrange
        const mockData = "I'm a CSV";

        await renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                http.get(API_PATH + "/quiz/group/2/download", ({request, params, cookies}) => {
                    return HttpResponse.text(mockData, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/csv",
                            "Content-Length": utf8ByteLength(mockData).toString(),
                        }
                    });
                }),
            ]
        });
        await navigateToAssignmentProgress();
        const groupDownloadLinks = await screen.findAllByText("Download tests CSV");

        // Act
        await userEvent.click(groupDownloadLinks[0]);

        // Assert
        // privacy modal is shown
        const modal = await screen.findByTestId("active-modal");
        expect(modal.textContent).toContain("Privacy Notice");
        // clicking "download" closes the modal
        await userEvent.click(within(modal).getByRole("link", {name: "Download CSV"}));
        await waitFor(() => {
            expect(modal).not.toBeInTheDocument();
        });
    });
});
