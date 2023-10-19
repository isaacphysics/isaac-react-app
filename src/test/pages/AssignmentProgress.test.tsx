import { screen } from "@testing-library/react";
import { renderTestEnvironment, followHeaderNavLink } from "../utils";
import { API_PATH } from "../../app/services";
import { mockActiveGroups, mockAssignmentsGroup2, mockQuizAssignments } from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import { buildGroupHandler } from "../../mocks/handlers";
import { rest } from "msw";

describe("AssignmentProgress", () => {
  it("shows an accordion section for each active group", async () => {
    renderTestEnvironment({
      role: "TUTOR",
    });
    await followHeaderNavLink("Teach", "Markbook");
    const groupTitles = await screen.findAllByTestId("group-name");
    expect(groupTitles).toHaveLength(mockActiveGroups.length);
  });

  it('shows both "Assignments" and "Tests" tabs to teachers', async () => {
    const mockGroup = mockActiveGroups[0];
    const mockAssignments = mockAssignmentsGroup2;
    const mockTestAssignments = mockQuizAssignments.filter((q) => q.groupId === mockGroup.id);
    renderTestEnvironment({
      role: "TEACHER",
      extraEndpoints: [
        rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
        rest.get(API_PATH + "/assignments/assign", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockAssignments));
        }),
        rest.get(API_PATH + "/quiz/assigned", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockTestAssignments));
        }),
      ],
    });
    await followHeaderNavLink("Teach", "Markbook");
    // Should only be one group
    const groupTitle = await screen.findByTestId("group-name");
    // Clicking on the group title should suffice to open the accordion
    await userEvent.click(groupTitle);
    // Get the two tabs, making sure that they show the correct numbers of assignments in each one
    const assignmentsTab = await screen.findByRole("button", { name: `Assignments (${mockAssignments.length})` });
    const testsTab = await screen.findByRole("button", { name: `Tests (${mockTestAssignments.length})` });
    await userEvent.click(assignmentsTab);
    for (const assignmentTitle of mockAssignments.map((a) => a.gameboard?.title)) {
      await screen.findByText(assignmentTitle, { exact: false });
    }
    await userEvent.click(testsTab);
    for (const testTitle of mockTestAssignments.map((q) => q.quizSummary?.title)) {
      await screen.findByText(testTitle as string, { exact: false });
    }
  });

  it("only shows assignments to tutors, with no tabs shown", async () => {
    const mockGroup = mockActiveGroups[0];
    const mockAssignments = mockAssignmentsGroup2;
    const mockTestAssignments = mockQuizAssignments.filter((q) => q.groupId === mockGroup.id);
    renderTestEnvironment({
      role: "TUTOR",
      extraEndpoints: [
        rest.get(API_PATH + "/groups", buildGroupHandler([mockGroup])),
        rest.get(API_PATH + "/assignments/assign", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockAssignments));
        }),
        rest.get(API_PATH + "/quiz/assigned", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockTestAssignments));
        }),
      ],
    });
    await followHeaderNavLink("Teach", "Markbook");
    // Should only be one group
    const groupTitle = await screen.findByTestId("group-name");
    // Clicking on the group title should suffice to open the accordion
    await userEvent.click(groupTitle);
    // Make sure that that tab buttons aren't shown
    const assignmentsTab = screen.queryByRole("button", { name: `Assignments (${mockAssignments.length})` });
    const testsTab = screen.queryByRole("button", { name: `Tests (${mockTestAssignments.length})` });
    expect(assignmentsTab).toBeNull();
    expect(testsTab).toBeNull();
    // Check that all assignments are showing
    for (const assignmentTitle of mockAssignments.map((a) => a.gameboard?.title)) {
      await screen.findByText(assignmentTitle, { exact: false });
    }
  });
});
