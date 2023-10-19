import { screen } from "@testing-library/react";
import {
  checkPageTitle,
  checkPasswordInputTypes,
  fillFormCorrectly,
  getFormFields,
  renderTestEnvironment,
} from "../utils";
import userEvent from "@testing-library/user-event";
import { StudentRegistration } from "../../app/components/pages/StudentRegistration";
import * as actions from "../../app/state/actions";
import { rest } from "msw";
import { API_PATH } from "../../app/services";
import { registrationMockUser, registrationUserData } from "../../mocks/data";

const registerUserSpy = jest.spyOn(actions, "registerUser");

describe("Student Registration", () => {
  const renderStudentRegistration = () => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: StudentRegistration,
      initialRouteEntries: ["/register/student"],
    });
  };

  it("On student registration page all expected fields are present and only student options are available", async () => {
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

  it("If fields are filled in wrong, error messages are displayed", async () => {
    renderStudentRegistration();
    await fillFormCorrectly(false, "student");
    const formFields = getFormFields();
    const { submitButton } = formFields;
    await userEvent.click(submitButton());
    const pwErrorMessage = screen.getByText(/Passwords must be at least 12 characters/i);
    expect(pwErrorMessage).toBeVisible();
    const generalError = screen.getByRole("heading", {
      name: /please fill out all fields/i,
    });
    expect(generalError).toBeVisible();
  });

  it("If fields are filled in correctly, pressing submit will attempt to create a user", async () => {
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

    await fillFormCorrectly(true, "student");
    const formFields = getFormFields();
    const { submitButton } = formFields;
    await userEvent.click(submitButton());

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

  it("Register button is disabled until recaptcha checkbox is ticked", async () => {
    renderStudentRegistration();
    checkPageTitle("Register as a student");
    const formFields = getFormFields();
    const { submitButton, recaptcha } = formFields;
    expect(submitButton()).toBeDisabled();
    await userEvent.click(recaptcha());
    expect(submitButton()).toBeEnabled();
  });

  it("Clicking the show password icon will make the text of password field visible, and the icon change", async () => {
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
