import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetAssignments } from "../../app/components/pages/SetAssignments";
import { mockActiveGroups, mockGameboards, mockSetAssignments } from "../../mocks/data";
import { dayMonthYearStringToDate, DDMMYYYY_REGEX, ONE_DAY_IN_MS, renderTestEnvironment } from "../utils";
import { API_PATH } from "../../app/services";
import { rest } from "msw";

const expectedTopLinks = {
  "Pre-made gameboards": "/pages/gameboards",
  "Topics list": "/topics",
  "Create gameboard": "/gameboard_builder",
};

describe("SetAssignments", () => {
  const renderSetAssignments = () => {
    renderTestEnvironment({
      PageComponent: SetAssignments,
      initialRouteEntries: ["/assignments"],
    });
  };

  it("should start in card view, with 6 gameboards shown", async () => {
    renderSetAssignments();
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull();
    });
    const viewDropdown: HTMLInputElement = await screen.findByLabelText("Display in");
    expect(viewDropdown.value).toEqual("Card View");
    expect(screen.queryAllByTestId("assignment-gameboard-card")).toHaveLength(6);
  });

  it("should show all gameboards in table view", async () => {
    renderSetAssignments();
    // Change view to "Table View"
    const viewDropdown = await screen.findByLabelText("Display in");
    await userEvent.selectOptions(viewDropdown, "Table View");
    // Make sure that all gameboards are listed
    const gameboardRows = await screen.findAllByTestId("assignment-gameboard-table-row");
    expect(gameboardRows).toHaveLength(mockGameboards.totalResults);
  });

  it("should have links to gameboards/relevant info to setting assignments at the top of the page", async () => {
    renderSetAssignments();
    for (const [title, href] of Object.entries(expectedTopLinks)) {
      const button = await screen.findByRole("link", { name: title });
      expect(button.getAttribute("href")).toBe(href);
    }
  });

  it("should show all the correct information for a gameboard in card view", async () => {
    renderSetAssignments();
    const gameboards = await screen.findAllByTestId("assignment-gameboard-card");

    const gameboard = gameboards[0];
    const mockGameboard = mockGameboards.results[0];

    // Check that group count is correct
    const assignmentsToGameboard = mockSetAssignments.filter((a) => a.gameboardId === mockGameboard.id);
    const groupsAssignedHexagon = await within(gameboard).findByTitle("Groups assigned");
    expect(groupsAssignedHexagon.textContent).toEqual(
      `${assignmentsToGameboard.length} group${assignmentsToGameboard.length === 1 ? "" : "s"}`,
    );

    // Check that created date is present and in the expected format
    const dateText = within(gameboard)
      .getByText("Created:")
      .textContent?.replace(/Created:\s?/, "");
    expect(dateText).toMatch(DDMMYYYY_REGEX);
    expect(mockGameboard.creationDate - (dayMonthYearStringToDate(dateText)?.valueOf() ?? 0)).toBeLessThanOrEqual(
      ONE_DAY_IN_MS,
    );

    // TODO fix stage and difficulty tests (broken since UI change Jan 2023)
    // Check that stages are displayed
    // const requiredStages = (mockGameboard.contents as {audience?: {stage?: STAGE[]}[]}[]).reduce(
    //     (set: Set<string>, q) => q.audience?.reduce(
    //         (_set: Set<string>, a) => a.stage?.reduce(
    //             (__set: Set<string>, t) => __set.add(stageLabelMap[t]),
    //             _set) ?? _set,
    //         set) ?? set,
    //     new Set<string>());
    // const stages = within(gameboard).getByText("Stages:").textContent?.replace(/Stages:\s?/, "")?.split(/,\s?/);
    //
    // if (!stages || stages.length === 0) {
    //     expect(requiredStages.size).toBe(0);
    // } else {
    //     requiredStages.forEach(s => {
    //         expect(stages?.includes(s)).toBeTruthy();
    //     });
    //     stages.forEach(s => {
    //         expect(requiredStages?.has(s)).toBeTruthy();
    //     });
    // }
    //
    // // Check for difficulty title TODO check for SVG using something like screen.getByTitle("Practice 2 (P2)...")
    // within(gameboard).getByText("Difficulty:");

    // Ensure we have a title with a link to the gameboard
    const title = within(gameboard).getByRole("link", { name: mockGameboard.title });
    expect(title.getAttribute("href")).toBe(`/assignment/${mockGameboard.id}`);

    // Ensure the assign/unassign button exists
    within(gameboard).getByRole("button", { name: /Assign\s?\/\s?Unassign/ });
  });

  it("should let you assign a gameboard in card view (using the modal)", async () => {
    let requestGroupIds: string[];
    let requestAssignment: { gameboardId: string; scheduledStartDate?: any; dueDate?: any; notes?: string };
    renderTestEnvironment({
      PageComponent: SetAssignments,
      initialRouteEntries: ["/assignments"],
      extraEndpoints: [
        rest.post(API_PATH + "/assignments/assign_bulk", async (req, res, ctx) => {
          const json = await req.json();
          requestGroupIds = json.map((x: any) => x.groupId);
          requestAssignment = json[0];
          return res(
            ctx.status(200),
            ctx.json(json.map((x: any) => ({ groupId: x.groupId, assignmentId: x.groupId * 2 }))),
          );
        }),
      ],
    });
    const gameboards = await screen.findAllByTestId("assignment-gameboard-card");
    const mockGameboard = mockGameboards.results[0];

    // Find and click assign gameboard button for the first gameboard
    const modalOpenButton = within(gameboards[0]).getByRole("button", { name: /Assign\s?\/\s?Unassign/ });
    await userEvent.click(modalOpenButton);

    // Wait for modal to appear, for the gameboard we expect
    const modal = await screen.findByTestId("set-assignment-modal");
    expect(modal).toHaveModalTitle(mockGameboard.title);
    // Ensure all active groups are selectable in the drop-down
    const selectContainer = within(modal).getByText(/Group(\(s\))?:/);
    const selectBox = within(modal).getByLabelText(/Group(\(s\))?:/);
    await userEvent.click(selectBox);
    mockActiveGroups.forEach((g) => {
      expect(selectContainer.textContent).toContain(g.groupName);
    });
    // Pick the second active group
    const group1Choice = within(selectContainer).getByText(mockActiveGroups[1].groupName);
    await userEvent.click(group1Choice);

    // Check scheduled start date and due date are there
    within(modal).getByLabelText("Schedule an assignment start date", { exact: false });
    within(modal).getByLabelText("Due date reminder", { exact: false });
    // TODO check setting scheduled start date and due date - might be best to transition to
    //  react-select date picker UI for this functionality anyway

    // Add some notes
    const testNotes = "Test notes to test groups for test assignments";
    const notesBox = within(modal).getByLabelText("Notes", { exact: false });
    await userEvent.type(notesBox, testNotes);

    // Assert that only first group is currently assigned to this board
    const currentAssignments = within(modal).queryAllByTestId("current-assignment");
    const pendingAssignments = within(modal).queryAllByTestId("pending-assignment");
    const allAssignments = currentAssignments.concat(pendingAssignments);
    expect(allAssignments).toHaveLength(1);
    expect(allAssignments[0].textContent).toContain(mockActiveGroups[0].groupName);

    // Click button
    const assignButton = within(modal).getByRole("button", { name: "Assign to group" });
    await userEvent.click(assignButton);

    // Expect request to be sent off with expected parameters
    await waitFor(() => {
      expect(requestGroupIds).toEqual([mockActiveGroups[1].id]);
      expect(requestAssignment.gameboardId).toEqual(mockGameboard.id);
      expect(requestAssignment.notes).toEqual(testNotes);
      expect(requestAssignment.dueDate).not.toBeDefined();
      expect(requestAssignment.scheduledStartDate).not.toBeDefined();
    });

    // Check that new assignment is displayed in the modal
    await waitFor(() => {
      const newCurrentAssignments = within(modal).queryAllByTestId("current-assignment");
      expect(newCurrentAssignments.map((a) => a.textContent).join(",")).toContain(mockActiveGroups[1].groupName);
    });

    // Close modal
    const closeButtons = within(modal).getAllByRole("button", { name: "Close" });
    expect(closeButtons).toHaveLength(2); // One at the top, one at the bottom
    await userEvent.click(closeButtons[0]);
    await waitFor(() => {
      expect(modal).not.toBeInTheDocument();
    });

    // Make sure the gameboard number of groups assigned is updated
    const groupsAssignedHexagon = await within(gameboards[0]).findByTitle("Groups assigned");
    expect(groupsAssignedHexagon.textContent).toEqual("2 groups");
  });
});
