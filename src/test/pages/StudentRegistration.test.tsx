import { screen } from "@testing-library/react";
import { checkPageTitle, clickButton, fillFormCorrectly, getFormFields, renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";
import { StudentRegistration } from "../../app/components/pages/StudentRegistration";
import * as actions from "../../app/state/actions";
import { rest } from "msw";
import { API_PATH } from "../../app/services";
import { registrationMockUser, registrationUserData } from "../../mocks/data";

const registerUserSpy = jest.spyOn(actions, "registerUser");

const checkPasswordInputTypes = (expectedType: string) => {
  const formFields = getFormFields();
  const passwordInput = formFields.password() as HTMLInputElement;
  const confirmPasswordInput = formFields.confirmPassword() as HTMLInputElement;
  [passwordInput, confirmPasswordInput].forEach((input) => expect(input.type).toBe(expectedType));
};

describe("Student Registration", () => {
  const renderStudentRegistration = () => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: StudentRegistration,
      initialRouteEntries: ["/register/student"],
      extraEndpoints: [
        rest.post(API_PATH + "/users", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(registrationMockUser));
        }),
      ],
    });
  };

  it("displays all expected fields and only student options are available", async () => {
    renderStudentRegistration();
    const form = screen.getByRole("form");
    checkPageTitle("Register as a student");
    const formFields = getFormFields();
    const {
      givenName,
      familyName,
      currentSchool,
      dob,
      email,
      gender,
      password,
      confirmPassword,
      stage,
      examBoard,
      assignmentPreferences,
      newsPreferences,
      events,
      submitButton,
      recaptcha,
    } = formFields;

    [
      givenName(),
      familyName(),
      currentSchool(),
      dob(),
      email(),
      gender(),
      password(),
      confirmPassword(),
      stage(),
      examBoard(),
      assignmentPreferences(),
      newsPreferences(),
      events(),
      submitButton(),
      recaptcha(),
    ].forEach((each) => expect(each).toBeVisible());
    expect(form).toHaveTextContent("I am studying");
    // student should not have the option to select all stages
    const allOption = Array.from(stage().options).find((option) => option.value === "all");
    expect(allOption).toBeUndefined();
  });

  it("displays error messages if fields are filled in wrong", async () => {
    renderStudentRegistration();
    await fillFormCorrectly(false, "student");
    await clickButton("Register my account");
    const pwErrorMessage = screen.getByText(/Passwords must be at least 12 characters/i);
    expect(pwErrorMessage).toBeVisible();
    const generalError = screen.getByRole("heading", {
      name: /please fill out all fields/i,
    });
    expect(generalError).toBeVisible();
  });

  it("attempts to create a user when submit is pressed, if fields are filled in correctly", async () => {
    renderStudentRegistration();
    await fillFormCorrectly(true, "student");
    await clickButton("Register my account");

    expect(registerUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        givenName: registrationUserData.givenName,
        familyName: registrationUserData.familyName,
        email: registrationUserData.email,
        gender: registrationUserData.gender,
        loggedIn: false,
      }),
      expect.objectContaining({
        EMAIL_PREFERENCE: {
          NEWS_AND_UPDATES: false,
          ASSIGNMENTS: true,
          EVENTS: false,
        },
      }),
      expect.objectContaining([
        {
          stage: registrationUserData.stage,
          examBoard: "aqa",
        },
      ]),
      "mocked-recaptcha-token",
    );
  });

  it("redirects to registration success page after form submission", async () => {
    renderStudentRegistration();
    await fillFormCorrectly(true, "student");
    await clickButton("Register my account");
    const newPage = location.pathname;
    expect(newPage).toBe("/register/success");
  });

  it("should disable register button until recaptcha checkbox is ticked", async () => {
    renderStudentRegistration();
    checkPageTitle("Register as a student");
    const formFields = getFormFields();
    const { submitButton, recaptcha } = formFields;
    expect(submitButton()).toBeDisabled();
    await userEvent.click(recaptcha());
    expect(submitButton()).toBeEnabled();
  });

  it("makes the text of password field visible, and the icon change if the show password icon is clicked", async () => {
    renderStudentRegistration();
    checkPageTitle("Register as a student");
    checkPasswordInputTypes("password");
    const showPasswordToggle = screen.queryByTestId("show-password-icon");
    if (showPasswordToggle) {
      await userEvent.click(showPasswordToggle);
    } else {
      fail("Show password icon not found");
    }
    checkPasswordInputTypes("text");
    const hidePasswordToggle = await screen.findByTestId("hide-password-icon");
    expect(hidePasswordToggle).toBeInTheDocument();
  });
});
