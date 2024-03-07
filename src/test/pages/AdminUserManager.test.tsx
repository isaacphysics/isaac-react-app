import { AdminUserManager } from "../../app/components/pages/AdminUserManager";
import { checkPageTitle, renderTestEnvironment, getById, clickButton } from "../utils";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as actions from "../../app/state/actions";
import * as popups from "../../app/state/actions/popups";
import { rest } from "msw";
import { API_PATH } from "../../app/services";
import { buildMockStudent, buildMockTeacher, mockUser } from "../../mocks/data";
import { store } from "../../app/state";
import { FRIENDLY_DATE_AND_TIME } from "../../app/components/elements/DateString";
import { Role } from "../../IsaacApiTypes";

const adminSearchSpy = jest.spyOn(actions, "adminUserSearchRequest");
const popupSpy = jest.spyOn(popups, "showToast");

const searchFields = {
  searchForm: () => screen.getByRole("form"),
  familyName: () =>
    screen.getByRole("textbox", {
      name: /find a user by family name:/i,
    }),
  email: () =>
    screen.getByRole("textbox", {
      name: /find a user by email:/i,
    }),
  school: () => screen.getByRole("combobox", { name: /find a user by school:/i }),
  role: () =>
    screen.getByRole("combobox", {
      name: /find by user role:/i,
    }),
  postcode: () =>
    screen.getByRole("textbox", {
      name: /find users with school within a given distance of postcode:/i,
    }),
  postcodeRadius: () => getById("postcode-radius-search"),
  searchButton: () => screen.getByRole("button", { name: "Search" }),
};

const mockSuccessfulPostRequest = (route: string) => {
  return rest.post(API_PATH + route, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  });
};

describe("Admin User Manager", () => {
  const renderUserManager = async ({ role = "ADMIN" }: { role?: Role } = {}) => {
    renderTestEnvironment({
      role: role,
      PageComponent: AdminUserManager,
      initialRouteEntries: ["/admin/usermanager"],
      extraEndpoints: [
        rest.get(API_PATH + "/admin/users", (req, res, ctx) => {
          const mockAdminSearchResults = [
            mockUser,
            { ...buildMockStudent(101), emailVerificationStatus: "NOT_VERIFIED" },
            buildMockTeacher(102),
          ];
          return res(ctx.status(200), ctx.json(mockAdminSearchResults));
        }),
        rest.get(API_PATH + "/users/school_lookup", (req, res, ctx) => {
          const mockSchoolLookup = {
            "1": { name: "Test School" },
            "101": { name: "N/A" },
            "102": { name: "N/A" },
          };
          return res(ctx.status(200), ctx.json(mockSchoolLookup));
        }),
        rest.get(API_PATH + "/schools", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json([
              {
                urn: "1",
                name: "Test School",
                postcode: "ABC 123",
                closed: false,
                dataSource: "GOVERNMENT_UK",
              },
            ]),
          );
        }),
        rest.delete(API_PATH + "/admin/users/:userId", (req, res, ctx) => {
          return res(ctx.status(204), ctx.json({}));
        }),
        ...[
          "/users/resetpassword",
          "/admin/users/change_role/:role",
          "/admin/users/change_email_verification_status/:status/true",
          "/admin/users/change_teacher_pending/:status",
          "/admin/users/merge",
        ].map((route) => mockSuccessfulPostRequest(route)),
      ],
    });
    await waitFor(() => {
      const userState = store.getState().user;
      expect(userState?.loggedIn).toBe(true);
    });
  };

  describe("Search section", () => {
    it("renders with expected page title and has all expected fields", async () => {
      await renderUserManager();
      checkPageTitle("User manager");
      const { searchForm, familyName, email, school, role, postcode, postcodeRadius, searchButton } = searchFields;
      [searchForm(), familyName(), email(), school(), role(), postcode(), postcodeRadius(), searchButton()].forEach(
        (input) => expect(input).toBeInTheDocument(),
      );
      const expectedRadiusOptions = ["5 miles", "10 miles", "15 miles", "20 miles", "25 miles", "50 miles"];
      const radiusOptions = within(postcodeRadius()).getAllByRole("option");
      expect(radiusOptions).toHaveLength(expectedRadiusOptions.length);
      radiusOptions.forEach((option, index) => {
        expect(option).toHaveTextContent(expectedRadiusOptions[index]);
      });
      const expectedRoleOptions = [
        "Any role",
        "Student",
        "Teacher",
        "Content editor",
        "Event leader",
        "Event manager",
        "Admin",
      ];
      const roleOptions = within(role()).getAllByRole("option");
      expect(roleOptions).toHaveLength(expectedRoleOptions.length);
      roleOptions.forEach((option, index) => expect(option).toHaveTextContent(expectedRoleOptions[index]));
    });

    it("searches if search button is pressed", async () => {
      await renderUserManager();
      await clickButton("Search");
      expect(adminSearchSpy).toHaveBeenCalled();
    });

    const textSearchCases = [
      { fieldName: "familyName", testValue: "Smith" },
      { fieldName: "email", testValue: "user@example.com" },
      { fieldName: "postcode", testValue: "ABC 123" },
    ];
    it.each(textSearchCases)(
      "searches with $fieldName if this text field is changed",
      async ({ fieldName, testValue }) => {
        await renderUserManager();
        const inputField = searchFields[fieldName as keyof typeof searchFields];
        fireEvent.change(inputField(), { target: { value: testValue } });
        await clickButton("Search");
        expect(adminSearchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            [fieldName]: testValue,
          }),
        );
      },
    );

    it("searches with schoolOther if a custom school name is selected", async () => {
      await renderUserManager();
      const schoolDropdown = searchFields.school;
      await userEvent.type(schoolDropdown(), "Custom School Name");
      const customSchoolName = await screen.findByTestId("custom-school-name");
      await userEvent.click(customSchoolName);
      await clickButton("Search");
      expect(adminSearchSpy).toHaveBeenCalledWith(expect.objectContaining({ schoolOther: "Custom School Name" }));
    });

    it("searches with schoolURN if a school is selected from dropdown", async () => {
      await renderUserManager();
      const schoolDropdown = searchFields.school;
      await userEvent.type(schoolDropdown(), "Test");
      const testSchool = await screen.findByText("Test School, ABC 123");
      await userEvent.click(testSchool);
      await clickButton("Search");
      expect(adminSearchSpy).toHaveBeenCalledWith(expect.objectContaining({ schoolURN: "1" }));
    });

    const dropdownSearchCases = [
      { fieldName: "role", testValue: "STUDENT" },
      { fieldName: "postcodeRadius", testValue: "TEN_MILES" },
    ];

    it.each(dropdownSearchCases)(
      "searches with $fieldName if this dropdown is changed",
      async ({ fieldName, testValue }) => {
        await renderUserManager();
        const dropdown = searchFields[fieldName as keyof typeof searchFields];
        await userEvent.selectOptions(dropdown(), testValue);
        await clickButton("Search");
        expect(adminSearchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            [fieldName]: testValue,
          }),
        );
      },
    );

    it("searches with null if user clears a text box", async () => {
      await renderUserManager();
      const { familyName } = searchFields;
      await userEvent.type(familyName(), "Smith");
      await clickButton("Search");
      expect(adminSearchSpy).toHaveBeenCalledWith(expect.objectContaining({ familyName: "Smith" }));
      await userEvent.clear(familyName());
      await clickButton("Search");
      expect(adminSearchSpy).toHaveBeenCalledWith(expect.objectContaining({ familyName: null }));
    });
  });

  describe("Manage users section", () => {
    const adminButtons = {
      modifyRole: () => screen.getByRole("button", { name: /modify role/i }),
      emailStatus: () => screen.queryByRole("button", { name: /email status/i }),
      teacherUpgrade: () => screen.getByRole("button", { name: /decline teacher upgrade/i }),
      email: () => screen.getByRole("link", { name: /email/i }),
    };

    const searchAndWaitForResults = async () => {
      await clickButton("Search");
      const resultsTable = within(getById("admin-search-results")).getByRole("table");
      expect(resultsTable).toBeInTheDocument();
      const tableRows = within(resultsTable).getAllByRole("row");
      const firstUserDetails = within(tableRows[1]).getAllByRole("cell");
      return { resultsTable, tableRows, firstUserDetails };
    };

    it("shows Manage Users heading and expected buttons", async () => {
      await renderUserManager();
      const heading = screen.getByRole("heading", { name: "Manage users (0) Selected (0)" });
      expect(heading).toBeInTheDocument();
      const { modifyRole, emailStatus, teacherUpgrade, email } = adminButtons;
      [modifyRole(), emailStatus(), teacherUpgrade(), email()].forEach((button) => expect(button).toBeInTheDocument());
    });

    const modifyRoleTestCases = [
      {
        role: "EVENT_MANAGER" as Role,
        expectedRoles: ["STUDENT", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR"],
      },
      {
        role: "ADMIN" as Role,
        expectedRoles: ["STUDENT", "TUTOR", "TEACHER", "EVENT_LEADER", "CONTENT_EDITOR", "EVENT_MANAGER"],
      },
    ];

    it.each(modifyRoleTestCases)(
      "shows correct options for modifying role for $role user",
      async ({ role, expectedRoles }) => {
        await renderUserManager({ role: role });
        const roleOptions = screen.getByTestId("modify-role-options");
        const buttons = Array.from(roleOptions.querySelectorAll("button"));
        buttons.forEach((button, index) => {
          expect(button).toHaveTextContent(expectedRoles[index]);
        });
        expect(within(roleOptions).queryByText("ADMIN", { selector: "button" })).toBeNull();
        if (role === "EVENT_MANAGER") {
          ["TUTOR", "EVENT_MANAGER"].forEach((button) =>
            expect(within(roleOptions).queryByText(button, { selector: "button" })).toBeNull(),
          );
        }
      },
    );

    it("does not show Email Status button for EVENT_MANAGER user", async () => {
      await renderUserManager({ role: "EVENT_MANAGER" });
      const { emailStatus } = adminButtons;
      expect(emailStatus()).not.toBeInTheDocument();
    });

    it("shows correct options for modifying email status for ADMIN user", async () => {
      await renderUserManager();
      const statusOptions = screen.getByTestId("email-status-options");
      const buttons = Array.from(statusOptions.querySelectorAll("button"));
      const expectedOptions = ["NOT_VERIFIED", "DELIVERY_FAILED"];
      buttons.forEach((button, index) => {
        expect(button).toHaveTextContent(expectedOptions[index]);
      });
    });

    it("shows a list of users with expected columns and data after a search is done", async () => {
      await renderUserManager();
      const { resultsTable, tableRows, firstUserDetails } = await searchAndWaitForResults();
      const headers = within(resultsTable).getAllByRole("columnheader");
      const expectedHeaders = [
        "Select",
        "Actions",
        "Name",
        "Email",
        "User role",
        "School",
        "Verification status",
        "Teacher pending?",
        "Member since",
        "Last seen",
      ];
      headers.forEach((header, index) => expect(header).toHaveTextContent(expectedHeaders[index]));
      expect(tableRows).toHaveLength(4);
      const expectedUserData = [
        "Admin, Test",
        "test-admin@test.com",
        "ADMIN",
        "Test School",
        "VERIFIED",
        "N",
        FRIENDLY_DATE_AND_TIME.format(mockUser.registrationDate),
        FRIENDLY_DATE_AND_TIME.format(mockUser.lastSeen),
      ];
      firstUserDetails.slice(2).forEach((cell, index) => expect(cell).toHaveTextContent(expectedUserData[index]));
    });

    it("shows a checkbox for selecting a user and buttons to View, Edit, Delete or Reset password", async () => {
      await renderUserManager();
      const { firstUserDetails } = await searchAndWaitForResults();
      const checkbox = within(firstUserDetails[0]).getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      const expectedButtons = ["View", "Edit", "Delete", "Reset password"];
      const buttons = Array.from(firstUserDetails[1].children);
      expect(buttons).toHaveLength(4);
      buttons.forEach((button, index) => expect(button).toHaveTextContent(expectedButtons[index]));
    });

    describe("User Manager buttons", () => {
      it("links to a new tab with target user's progress page from View button", async () => {
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const viewButton = within(firstUserDetails[1]).getByText("View");
        expect(viewButton).toHaveAttribute("href", "/progress/1");
        expect(viewButton).toHaveAttribute("target", "_blank");
      });

      it("opens a new tab with user's account page if Edit button is clicked", async () => {
        jest.spyOn(window, "open").mockImplementation(jest.fn());
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const editButton = within(firstUserDetails[1]).getByText("Edit");
        await userEvent.click(editButton);
        expect(window.open).toHaveBeenCalledWith(expect.stringContaining("/account?userId=1"), "_blank");
      });

      it("shows a confirmation popup if Delete button is clicked", async () => {
        jest.spyOn(window, "confirm").mockImplementation(jest.fn());
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const deleteButton = within(firstUserDetails[1]).getByText("Delete");
        await userEvent.click(deleteButton);
        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this user?");
      });

      it("continues to delete a user if the confirmation popup is accepted", async () => {
        const deleteSpy = jest.spyOn(actions, "adminUserDelete");
        jest.spyOn(window, "confirm").mockReturnValueOnce(true);
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const deleteButton = within(firstUserDetails[1]).getByText("Delete");
        await userEvent.click(deleteButton);
        expect(deleteSpy).toHaveBeenCalledWith(1);
        expect(popupSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "User deleted" }));
      });

      it("sends a password request if the Reset password button is clicked", async () => {
        const resetPasswordSpy = jest.spyOn(actions, "resetPassword");
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const resetPasswordButton = within(firstUserDetails[1]).getByText("Reset password");
        await userEvent.click(resetPasswordButton);
        expect(resetPasswordSpy).toHaveBeenCalledWith({ email: mockUser.email });
        expect(popupSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "Password reset email sent" }));
      });

      it("modifies the user role if Modify Role clicked, a role clicked, and email status is already verified", async () => {
        const modifyRoleSpy = jest.spyOn(actions, "adminModifyUserRoles");
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const checkbox = within(firstUserDetails[0]).getByRole("checkbox");
        await userEvent.click(checkbox);
        const roleOptions = screen.getByTestId("modify-role-options");
        const teacherRoleUpgradeButton = within(roleOptions).getByText("TEACHER", { selector: "button" });
        await userEvent.click(teacherRoleUpgradeButton);
        expect(modifyRoleSpy).toHaveBeenCalledWith("TEACHER", [mockUser.id]);
      });

      it("shows a popup warning if attempting to change the role of a user with unverified email address", async () => {
        await renderUserManager();
        const { tableRows } = await searchAndWaitForResults();
        const secondUserDetails = within(tableRows[2]).getAllByRole("cell");
        const checkbox = within(secondUserDetails[0]).getByRole("checkbox");
        await userEvent.click(checkbox);
        const roleOptions = screen.getByTestId("modify-role-options");
        const teacherRoleUpgradeButton = within(roleOptions).getByText("TEACHER", { selector: "button" });
        await userEvent.click(teacherRoleUpgradeButton);
        expect(window.confirm).toHaveBeenCalledWith(
          expect.stringContaining("Are you really sure you want to promote unverified user(s)"),
        );
      });

      it("updates the email status of a user if Email Status button is clicked and a status chosen", async () => {
        const modifyEmailStatusSpy = jest.spyOn(actions, "adminModifyUserEmailVerificationStatuses");
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const checkbox = within(firstUserDetails[0]).getByRole("checkbox");
        await userEvent.click(checkbox);
        const notVerifiedEmailStatus = within(screen.getByTestId("email-status-options")).getByText("NOT_VERIFIED", {
          selector: "button",
        });
        await userEvent.click(notVerifiedEmailStatus);
        expect(modifyEmailStatusSpy).toHaveBeenCalledWith("NOT_VERIFIED", [mockUser.email]);
      });
      it("sets teacher pending status to false if Decline Teacher Upgrade button is clicked", async () => {
        const modifyTeacherPendingSpy = jest.spyOn(actions, "adminModifyTeacherPending");
        await renderUserManager();
        const { firstUserDetails } = await searchAndWaitForResults();
        const checkbox = within(firstUserDetails[0]).getByRole("checkbox");
        await userEvent.click(checkbox);
        await clickButton("Decline Teacher Upgrade");
        expect(modifyTeacherPendingSpy).toHaveBeenCalledWith(false, [mockUser.id]);
      });
    });
  });
  describe("Merge accounts", () => {
    it("does not show for EVENT_MANAGER users", async () => {
      await renderUserManager({ role: "EVENT_MANAGER" });
      expect(screen.queryByText("Merge user accounts")).toBeNull();
    });

    it("shows for ADMIN users", async () => {
      await renderUserManager();
      expect(screen.getByText("Merge user accounts")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Merge" })).toBeInTheDocument();
    });

    it("disables merge button until two user IDs are provided", async () => {
      await renderUserManager();
      const mergeButton = screen.getByRole("button", { name: "Merge" });
      expect(mergeButton).toBeDisabled();
      const firstUserId = screen.getByPlaceholderText("User ID to keep");
      const secondUserId = screen.getByPlaceholderText("User ID to delete");
      await userEvent.type(firstUserId, "1");
      expect(mergeButton).toBeDisabled();
      await userEvent.type(secondUserId, "2");
      expect(mergeButton).toBeEnabled();
    });

    const attemptUserMerge = async () => {
      const mergeButton = screen.getByRole("button", { name: "Merge" });
      const firstUserId = screen.getByPlaceholderText("User ID to keep");
      const secondUserId = screen.getByPlaceholderText("User ID to delete");
      await userEvent.type(firstUserId, "1");
      await userEvent.type(secondUserId, "2");
      await userEvent.click(mergeButton);
    };

    it("shows a popup confirmation window if merge button is clicked", async () => {
      jest.spyOn(window, "confirm").mockImplementation(jest.fn());
      await renderUserManager();
      await attemptUserMerge();
      expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Are you sure you want to merge"));
    });

    it("attempts to merge two user accounts if the merge confirmation is accepted and success confirmation appears", async () => {
      const mergeSpy = jest.spyOn(actions, "mergeUsers");
      jest.spyOn(window, "confirm").mockReturnValueOnce(true);
      await renderUserManager();
      await attemptUserMerge();
      expect(mergeSpy).toHaveBeenCalledWith(1, 2);
      expect(popupSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "Users merged" }));
    });
  });
});
