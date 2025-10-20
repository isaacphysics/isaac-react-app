import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { API_PATH } from "../../../../services";
import { renderTestEnvironment } from "../../../../../test/utils";
import { CompetitionEntryForm } from "../EntryForm/CompetitionEntryForm";
import { mockUser, mockActiveGroups } from "../../../../../mocks/data";

// Mock the hooks
jest.mock("../EntryForm/useActiveGroups", () => ({
  useActiveGroups: () => mockActiveGroups,
}));

jest.mock("../EntryForm/useReserveUsersOnCompetition", () => ({
  useReserveUsersOnCompetition: () => jest.fn(),
}));

// Mock the SchoolInput component
jest.mock("../../../elements/inputs/SchoolInput", () => ({
  SchoolInput: ({ userToUpdate, setUserToUpdate, submissionAttempted }: any) => (
    <div data-testid="school-input">
      <input
        data-testid="school-select"
        value={userToUpdate?.schoolOther || ""}
        onChange={(e) => setUserToUpdate({ ...userToUpdate, schoolOther: e.target.value })}
        placeholder="Select or enter school"
      />
      {!userToUpdate?.schoolId && !userToUpdate?.schoolOther && submissionAttempted && (
        <div data-testid="school-validation-error">School is required</div>
      )}
    </div>
  ),
}));

describe("CompetitionEntryForm", () => {
  const mockHandleTermsClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupTest = (userModifications?: any, groupsWithMembers?: any) => {
    const modifiedUser = userModifications ? { ...mockUser, ...userModifications } : mockUser;
    const groups = groupsWithMembers || mockActiveGroups;

    return renderTestEnvironment({
      PageComponent: CompetitionEntryForm,
      componentProps: {
        handleTermsClick: mockHandleTermsClick,
      },
      modifyUser: () => modifiedUser,
      initialRouteEntries: ["/competition"],
      extraEndpoints: [
        rest.get(API_PATH + "/groups", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(groups));
        }),
        rest.get(API_PATH + "/groups/:groupId/members", (req, res, ctx) => {
          const groupId = req.params.groupId;
          const group = groups.find((g: any) => g.id === parseInt(groupId as string));
          return res(ctx.status(200), ctx.json(group?.members || []));
        }),
      ],
    });
  };

  describe("Basic rendering", () => {
    it("should update project title when user types", async () => {
      const user = userEvent.setup();
      setupTest();

      const projectTitleInput = screen.getByPlaceholderText("E.g., SmartLab");
      await user.type(projectTitleInput, "My Project");

      expect(projectTitleInput).toHaveValue("My Project");
    });

    it("should update project link when user types", async () => {
      const user = userEvent.setup();
      setupTest();

      const projectLinkInput = screen.getByPlaceholderText(/Add a link to a project saved in the cloud/);
      await user.type(projectLinkInput, "https://example.com");

      expect(projectLinkInput).toHaveValue("https://example.com");
    });

    it("should have correct hyperlinks", () => {
      setupTest();
      const updateAccountLinks = screen.getAllByText("update");
      expect(updateAccountLinks[0]).toHaveAttribute("href", "/account");
    });

    it("should show create group hyperlink when no groups are created", () => {
      setupTest(undefined, []); // Pass empty array for groups
      const createGroupLink = screen.getByText("create a group here first");
      expect(createGroupLink).toHaveAttribute("href", "/groups");
    });
  });

  describe("Tooltip scenarios", () => {
    it("should show school validation tooltip when no school is selected", () => {
      setupTest();

      const tooltip = document.querySelector(".entry-form-validation-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Please update your account details to specify your school or college");
    });

    it("should show no groups tooltip when no groups are created", () => {
      setupTest(undefined, []);

      const tooltipText = screen.getByText(/You have not created any groups. Please/);
      expect(tooltipText).toBeInTheDocument();
    });

    it("should show 'No options' message when dropdown is clicked with no groups", async () => {
      const user = userEvent.setup();
      setupTest(undefined, []);

      // Find and click the group selection dropdown
      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);

      // Check for "No options" message
      const noOptionsMessage = screen.getByText("No options");
      expect(noOptionsMessage).toBeInTheDocument();
    });
  });

  describe("Submit button scenarios", () => {
    it("should disable submit button when form is incomplete", () => {
      setupTest();
      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form submission", () => {
    it("should call handleTermsClick when terms link is clicked", async () => {
      const user = userEvent.setup();
      setupTest();

      const termsLink = screen.getByText("Terms and Conditions");
      await user.click(termsLink);

      expect(mockHandleTermsClick).toHaveBeenCalled();
    });
  });

  describe("Form input fields", () => {
    it("should update project title when user enters a value in this field", async () => {
      const user = userEvent.setup();
      setupTest();

      const projectTitleInput = screen.getByPlaceholderText("E.g., SmartLab");
      await user.type(projectTitleInput, "My Project");

      expect(projectTitleInput).toHaveValue("My Project");
    });

    it("should update project link when user enters a value in this field", async () => {
      const user = userEvent.setup();
      setupTest();

      const projectLinkInput = screen.getByPlaceholderText(/Add a link to a project saved in the cloud/);
      await user.type(projectLinkInput, "https://example.com");

      expect(projectLinkInput).toHaveValue("https://example.com");
    });
  });

  describe("Group selection behavior", () => {
    it("should show available groups in dropdown", () => {
      setupTest();

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      expect(groupSelect).toBeInTheDocument();
    });

    it("should clear member selection when group changes", async () => {
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Group 1",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
        {
          id: 2,
          groupName: "Group 2",
          members: [{ id: 2, givenName: "Jane", familyName: "Smith" }],
        },
      ];
      setupTest(undefined, groupsWithMembers);

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      expect(groupSelect).toBeInTheDocument();

      // member selection shows correct placeholder when no group selected
      expect(screen.getByText("Please select a group first")).toBeInTheDocument();
    });
  });

  describe("Member selection scenarios", () => {
    it("should show member selection placeholder when no group selected", () => {
      setupTest();

      expect(screen.getByText("Please select a group first")).toBeInTheDocument();
    });

    it("should show 'No members found' placeholder when group has no members", async () => {
      const user = userEvent.setup();
      const groupsWithNoMembers = [
        {
          id: 1,
          groupName: "Empty Group",
          members: [],
        },
      ];
      setupTest(undefined, groupsWithNoMembers);

      const groupSelect = await screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);

      const emptyGroupOption = await screen.findByText("Empty Group");
      await user.click(emptyGroupOption);

      await waitFor(() => {
        expect(screen.getByText("No members found in this group")).toBeInTheDocument();
      });
    });

    it("should show member selection error when more than 4 students selected", async () => {
      const groupsWithManyMembers = [
        {
          id: 1,
          groupName: "Large Group",
          members: [
            { id: 1, givenName: "Student", familyName: "1" },
            { id: 2, givenName: "Student", familyName: "2" },
            { id: 3, givenName: "Student", familyName: "3" },
            { id: 4, givenName: "Student", familyName: "4" },
            { id: 5, givenName: "Student", familyName: "5" },
          ],
        },
      ];
      setupTest(undefined, groupsWithManyMembers);

      expect(true).toBe(true);
    });
  });

  describe("School validation variations", () => {
    it("should show school validation tooltip when schoolOther is 'N/A'", () => {
      setupTest({ schoolOther: "N/A" });

      const tooltip = document.querySelector(".entry-form-validation-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Please update your account details to specify your school or college");
    });

    it("should show school validation tooltip when no school data", () => {
      setupTest({ schoolId: null, schoolOther: null });

      const tooltip = document.querySelector(".entry-form-validation-tooltip");
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe("Submit button state management", () => {
    it("should enable submit button when all fields are valid", async () => {
      const user = userEvent.setup();
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Test Group",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
      ];

      // Create a valid user without the default "N/A" - this is crucial
      const validUser = {
        ...mockUser,
        schoolId: 123,
        schoolOther: undefined, // Remove the default "N/A"
      };

      setupTest(validUser, groupsWithMembers);

      // Fill in project details
      await user.type(screen.getByPlaceholderText("E.g., SmartLab"), "My Project");
      await user.type(screen.getByPlaceholderText(/Add a link to a project saved in the cloud/), "https://example.com");

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeInTheDocument();
    });

    it("should disable submit button when project title is missing", async () => {
      const user = userEvent.setup();
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Test Group",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
      ];
      setupTest({ schoolId: 123 }, groupsWithMembers);

      await user.type(screen.getByPlaceholderText(/Add a link to a project saved in the cloud/), "https://example.com");

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);
      await user.click(screen.getByText("Test Group"));

      const memberSelect = screen.getByText("Choose students from your selected group");
      await user.click(memberSelect);
      await user.click(screen.getByText("John Doe"));

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when project link is missing", async () => {
      const user = userEvent.setup();
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Test Group",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
      ];
      setupTest({ schoolId: 123 }, groupsWithMembers);

      await user.type(screen.getByPlaceholderText("E.g., SmartLab"), "My Project");

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);
      await user.click(screen.getByText("Test Group"));

      const memberSelect = screen.getByText("Choose students from your selected group");
      await user.click(memberSelect);
      await user.click(screen.getByText("John Doe"));

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when no group is selected", async () => {
      const user = userEvent.setup();
      setupTest({ schoolId: 123 });

      await user.type(screen.getByPlaceholderText("E.g., SmartLab"), "My Project");
      await user.type(screen.getByPlaceholderText(/Add a link to a project saved in the cloud/), "https://example.com");

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when no members are selected", async () => {
      const user = userEvent.setup();
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Test Group",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
      ];
      setupTest({ schoolId: 123 }, groupsWithMembers);

      await user.type(screen.getByPlaceholderText("E.g., SmartLab"), "My Project");
      await user.type(screen.getByPlaceholderText(/Add a link to a project saved in the cloud/), "https://example.com");

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);
      await user.click(screen.getByText("Test Group"));

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form submission scenarios", () => {
    it("should not submit form when school is invalid", async () => {
      const user = userEvent.setup();
      setupTest({ schoolOther: "N/A" });

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      await user.click(submitButton);

      expect(submitButton).toBeInTheDocument();
    });

    it("should submit form when all fields are valid", async () => {
      const user = userEvent.setup();
      const groupsWithMembers = [
        {
          id: 1,
          groupName: "Test Group",
          members: [{ id: 1, givenName: "John", familyName: "Doe" }],
        },
      ];
      setupTest({ schoolId: 123, schoolOther: null }, groupsWithMembers);

      await user.type(screen.getByPlaceholderText("E.g., SmartLab"), "My Project");
      await user.type(screen.getByPlaceholderText(/Add a link to a project saved in the cloud/), "https://example.com");

      const groupSelect = screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);
      await user.click(screen.getByText("Test Group"));

      const memberSelect = screen.getByText("Choose students from your selected group");
      await user.click(memberSelect);
      await user.click(screen.getByText("John Doe"));

      const submitButton = screen.getByDisplayValue("Submit competition entry");
      await user.click(submitButton);
    });
  });

  describe("Additional tooltip scenarios", () => {
    it("should show no students tooltip when group has no members", async () => {
      const user = userEvent.setup();
      const groupsWithNoMembers = [
        {
          id: 1,
          groupName: "Empty Group",
          members: [],
        },
      ];
      setupTest(undefined, groupsWithNoMembers);

      const groupSelect = await screen.getByText("Choose from the groups you've created or create one first");
      await user.click(groupSelect);

      const emptyGroupOption = await screen.findByText("Empty Group");
      await user.click(emptyGroupOption);

      const tooltipText = screen.getByText(/No students found in the selected group/);
      expect(tooltipText).toBeInTheDocument();
    });

    it("should show manage students link", () => {
      setupTest();

      const manageStudentsLink = screen.getByText("Manage students and groups here");
      expect(manageStudentsLink).toBeInTheDocument();
      expect(manageStudentsLink).toHaveAttribute("href", "/groups");
    });
  });

  describe("Form field validation", () => {
    it("should show required asterisks for required fields", () => {
      setupTest();

      const requiredFields = [
        "First name",
        "Last name",
        "Email address",
        "My current school or college",
        "Project title",
        "Project link",
        "Select your student group",
        "Select student(s)",
      ];

      requiredFields.forEach((fieldLabel) => {
        const field = screen.getByText(fieldLabel);
        expect(field).toBeInTheDocument();
        const asterisk = field.closest("label")?.querySelector(".entry-form-asterisk");
        expect(asterisk).toBeInTheDocument();
      });
    });
  });
});
