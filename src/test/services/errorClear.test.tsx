import { screen, within } from "@testing-library/react";
import { checkPageTitle, clickButton, fillTextField, renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { API_PATH } from "../../app/services";
import * as actions from "../../app/state/actions";

const fillFormIncorrectly = async () => {
  const emailInput = screen.getByRole("textbox", {
    name: /email address/i,
  });
  const passwordInput = screen.getByLabelText(/password/i);
  await fillTextField(emailInput, "randomTestEmail@test.com");
  await fillTextField(passwordInput, "randomTestPassword123!");
};

describe("ErrorClear", () => {
  it("If an error is received from API and stored into state, this will display on the page, but when changing route it will clear", async () => {
    const clearErrorSpy = jest.spyOn(actions, "clearError");

    renderTestEnvironment({
      role: "ANONYMOUS",
      extraEndpoints: [
        rest.post(API_PATH + "/auth/SEGUE/authenticate", (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({
              errorMessage: "Incorrect credentials provided.",
              bypassGenericSiteErrorPage: false,
            }),
          );
        }),
      ],
    });
    const header = await screen.findByTestId("header");
    const logIn = within(header).getByRole("link", { name: "Log in" });
    await userEvent.click(logIn);
    checkPageTitle("log in or sign up:");
    await fillFormIncorrectly();
    await clickButton("Log in");
    const errorMessage = screen.queryByText(/incorrect credentials/i);
    expect(errorMessage).toBeInTheDocument();
    // navigate to the student registration page, which should clear the error
    const signUp = within(header).getByRole("link", { name: "Sign up" });
    await userEvent.click(signUp);
    checkPageTitle("Register for a free account");
    // Locate the radio button for student and continue to student registration
    const radioButton = screen.getByLabelText("Student");
    await userEvent.click(radioButton);
    await clickButton("Continue");
    checkPageTitle("Register as a student");
    // expect clearError to have happened 4 times - once on homepage, once on Login page, once on Registration page, once on Student registration page
    expect(clearErrorSpy).toHaveBeenCalledTimes(4);
    // check if error message is still present:
    const errorMessage2 = screen.queryByText(/incorrect credentials/i);
    expect(errorMessage2).not.toBeInTheDocument();
    clearErrorSpy.mockRestore();
  });
});
