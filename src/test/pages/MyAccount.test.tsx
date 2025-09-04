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
    await userEvent.type(currentPasswordField, invalidPassword);
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, validPassword);
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, validPassword);
    expect(saveButton).toBeEnabled();
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
    await userEvent.type(currentPasswordField, invalidPassword);
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
    await userEvent.type(currentPasswordField, invalidPassword);
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, invalidPassword);
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, invalidPassword);

    await waitFor(() => {
      const errorMessage = getById("invalidPassword");
      expect(errorMessage).toHaveTextContent(invalidPasswordError);
    });

    expect(saveButton).toBeDisabled();
  });
});
