import { checkPageTitle, clickButton, renderTestEnvironment } from "../utils";
import { TeacherRequest } from "../../app/components/pages/TeacherRequest";
import { RestHandler, rest } from "msw";
import { API_PATH } from "../../app/services";
import { screen } from "@testing-library/react";
import { produce } from "immer";
import { mockUser } from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import * as actions from "../../app/state/actions";
import { RegisteredUserDTO } from "../../IsaacApiTypes";

function checkDisabledAndCorrectValue(input: HTMLElement, expectedValue: string) {
  expect(input).toHaveValue(expectedValue);
  expect(input).toBeDisabled();
}

const upgradeAccountSpy = jest.spyOn(actions, "upgradeAccount");

describe("TeacherRequest", () => {
  const setupTest = ({
    role,
    extraEndpoints,
    modifyUser,
  }: {
    role: "TEACHER" | "STUDENT";
    extraEndpoints?: RestHandler<never>[];
    modifyUser?: (u: RegisteredUserDTO) => RegisteredUserDTO;
  }) => {
    renderTestEnvironment({
      role: role,
      modifyUser: modifyUser,
      PageComponent: TeacherRequest,
      initialRouteEntries: ["/teacher_account_request"],
      extraEndpoints: extraEndpoints,
    });
  };

  it("renders without crashing", () => {
    setupTest({ role: "STUDENT" });
    checkPageTitle("Teacher account request");
  });

  it("displays a warning message if one is returned from the server", async () => {
    const warningMessage = {
      id: "teacher_registration_warning_message",
      type: "isaacPageFragment",
      canonicalSourceFile: "content/general_pages/fragments/teacher_registration_warning_message.json",
      title: "Teacher registration",
      encoding: "markdown",
      children: [
        {
          type: "content",
          encoding: "html",
          children: [],
          value: "<p>Test warning message</p>",
          published: false,
          tags: [],
        },
      ],
    };
    const extraEndpoints = [
      rest.get(API_PATH + `/pages/fragments/teacher_registration_warning_message`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(warningMessage));
      }),
    ];
    setupTest({ role: "STUDENT", extraEndpoints });
    const warning = await screen.findByTestId("teacher-upgrade-warning");
    expect(warning).toHaveTextContent("Test warning message");
  });

  it("does not display a warning message if none are returned from the server", () => {
    const extraEndpoints = [
      rest.get(API_PATH + `/pages/fragments/teacher_registration_warning_message`, (req, res, ctx) => {
        return res(
          ctx.status(404),
          ctx.json({
            responseCode: 404,
            responseCodeType: "Not Found",
            errorMessage:
              "No content found that matches the query with parameters: [[teacher_registration_warning_message], [isaacPageFragment]]",
            bypassGenericSiteErrorPage: false,
          }),
        );
      }),
    ];
    setupTest({ role: "STUDENT", extraEndpoints });
    const warning = screen.queryByTestId("teacher-upgrade-warning");
    expect(warning).not.toBeInTheDocument();
  });

  it("displays a message, and no form, if the user is already a teacher", async () => {
    setupTest({ role: "TEACHER" });
    const message = await screen.findByTestId("already-teacher-account");
    expect(message).toHaveTextContent("You already have a teacher account");
    const form = screen.queryByRole("form");
    expect(form).not.toBeInTheDocument();
  });

  it("displays a message, and no form, if the user already has a pending request", async () => {
    const modifyUser = (user: RegisteredUserDTO) =>
      produce(user, (u) => {
        u.teacherPending = true;
      });
    setupTest({ role: "STUDENT", modifyUser });
    const message = await screen.findByTestId("teacher-pending-account");
    expect(message).toHaveTextContent("You already have a teacher upgrade request pending");
    const form = screen.queryByRole("form");
    expect(form).not.toBeInTheDocument();
  });

  it("if student account and no pending request, displays the form with values matching the account", async () => {
    setupTest({ role: "STUDENT" });
    const form = await screen.findByRole("form");
    expect(form).toBeInTheDocument();

    const inputs = [
      { name: "First name", value: mockUser.givenName },
      { name: "Last name", value: mockUser.familyName },
      { name: "Email address", value: mockUser.email },
      { name: "School", value: mockUser.schoolOther },
    ];

    inputs.forEach(({ name, value }) => {
      const input = screen.getByRole("textbox", { name });
      expect(input).toBeInTheDocument();
      checkDisabledAndCorrectValue(input, value!);
    });

    const userVerificationInput = screen.getByLabelText(/URL of a page on your school website/);
    const otherInformationInput = screen.getByLabelText(/Any other information/);
    [userVerificationInput, otherInformationInput].forEach((input) => {
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });
  });

  const warningTestCases = [
    {
      name: "displays a warning if the email address is unverified, and Submit is disabled",
      modifyUser: (user: RegisteredUserDTO) =>
        produce(user, (u) => {
          u.emailVerificationStatus = "NOT_VERIFIED";
        }),
      expectedWarningTestId: "email-unverified",
    },
    {
      name: "displays a warning if the email address is invalid for a teacher account, and Submit is disabled",
      modifyUser: (user: RegisteredUserDTO) =>
        produce(user, (u) => {
          u.email = "exampleteacher@gmail.com";
        }),
      expectedWarningTestId: "invalid-email",
    },
    {
      name: "displays a warning if no school is selected, and Submit is disabled",
      modifyUser: (user: RegisteredUserDTO) =>
        produce(user, (u) => {
          u.schoolOther = undefined;
        }),
      expectedWarningTestId: "no-school-selected",
    },
  ];

  warningTestCases.forEach(({ name, modifyUser, expectedWarningTestId }) => {
    it(name, async () => {
      setupTest({ role: "STUDENT", modifyUser });
      const warning = await screen.findByTestId(expectedWarningTestId);
      expect(warning).toBeInTheDocument();
      const submitButton = screen.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeDisabled();
    });
  });

  it("if no Verification Details are specified, form does not submit", async () => {
    setupTest({ role: "STUDENT" });
    await clickButton("Submit");
    expect(upgradeAccountSpy).not.toHaveBeenCalled();
  });

  it("if Verification Details are specified, form submits and displays success message", async () => {
    const extraEndpoints = [
      rest.post(API_PATH + `/users/request_role_change`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ ...mockUser, role: "STUDENT", teacherPending: true }));
      }),
    ];
    setupTest({ role: "STUDENT", extraEndpoints });
    const verificationDetailsInput = screen.getByLabelText(/URL of a page on your school website/);
    const otherInformationInput = screen.getByLabelText(/Any other information/);
    await userEvent.type(verificationDetailsInput, "https://example.com");
    await userEvent.type(otherInformationInput, "Test other information");
    await clickButton("Submit");
    expect(upgradeAccountSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationDetails: "https://example.com",
        otherInformation: "Test other information",
      }),
    );
    const successMessage = await screen.findByTestId("submit-success");
    expect(successMessage).toBeInTheDocument();
  });
});
