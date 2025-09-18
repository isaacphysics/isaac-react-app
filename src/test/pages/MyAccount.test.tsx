import { screen, within, waitFor } from "@testing-library/react";
import { getById, renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";
import { PASSWORD_REQUIREMENTS } from "../../app/services";

const validPassword = "Testing123456!";
const invalidPassword = "password";
const wrongPassword = "wrongPassword";
const noMatchError = "New passwords must match.";
const invalidPasswordError = PASSWORD_REQUIREMENTS;

describe("My Account", () => {
  it("Submit button should be disabled until all PW fields in My Account are filled and meeting requirements", async () => {
    renderTestEnvironment({ role: "STUDENT" });
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "My Account" });
    await userEvent.click(myAccount);
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, validPassword);
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, validPassword);
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, validPassword);

    // Wait for the button to enable
    await waitFor(
      () => {
        expect(saveButton).not.toHaveAttribute("disabled");
      },
      { timeout: 3000 },
    );
  });

  it("If passwords do not match, Save button stays disabled and informative error appears", async () => {
    renderTestEnvironment({ role: "STUDENT" });
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "My Account" });
    await userEvent.click(myAccount);
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, validPassword);
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, validPassword);
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, wrongPassword);
    const errorMessage = getById("invalidPassword");
    expect(saveButton).toBeDisabled();
    expect(errorMessage).toHaveTextContent(noMatchError);
  });

  it("If passwords match but do not meet requirements, Save button stays disabled and informative error appears", async () => {
    renderTestEnvironment({ role: "STUDENT" });
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "My Account" });
    await userEvent.click(myAccount);
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();

    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, validPassword);

    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, invalidPassword);

    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, invalidPassword);

    // Wait for the validation to update and check for the password requirements error
    await waitFor(
      () => {
        const errorMessage = getById("invalidPassword");
        expect(errorMessage).toHaveTextContent(invalidPasswordError);
      },
      { timeout: 5000 },
    );

    expect(saveButton).toBeDisabled();
  });
});
