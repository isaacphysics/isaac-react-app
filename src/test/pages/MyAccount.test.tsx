import { screen, within } from "@testing-library/react";
import { getById, renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";
import { PASSWORD_REQUIREMENTS } from "../../app/services";

const validPassword = "Testing123456!"
const invalidPassword = "password"
const wrongPassword = "wrongPassword"
const noMatchError = "New passwords must match."
const invalidPasswordError = PASSWORD_REQUIREMENTS

describe("My Account", () => {
  it("Submit button should be disabled until all PW fields in My Account are filled and meeting requirements", async () => {
    renderTestEnvironment({role: "STUDENT"});
    //locate "My Account" in the header and click on it
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "MY ACCOUNT" });
    await userEvent.click(myAccount);
    // wait for My Account page to load then click on the "Account Security" tab
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    // Find the Save button and check that it is currently disabled
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    // Find the current password field and enter a password
    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, invalidPassword);
    // Find the new password field and enter a password
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, validPassword);
    // Find the confirm password field and enter a password
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, validPassword);
    expect(saveButton).toBeEnabled();
  });


  it("If passwords do not match, Save button stays disabled and informative error appears", async () => {
    renderTestEnvironment({role: "STUDENT"});
    //locate "My Account" in the header and click on it
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "MY ACCOUNT" });
    await userEvent.click(myAccount);
    // wait for My Account page to load then click on the "Account Security" tab
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    // Find the Save button and check that it is currently disabled
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    // Find the current password field and enter a password
    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, invalidPassword);
    // Find the new password field and enter a password
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, validPassword);
    // Find the confirm password field and enter a password
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, wrongPassword);
    const errorMessage = getById("passwordConfirmationValidationMessage")
    expect(saveButton).toBeDisabled();
    expect(errorMessage).toHaveTextContent(noMatchError);
  });

  it("If passwords match but do not meet requirements, Save button stays disabled and informative error appears", async () => {
    renderTestEnvironment({role: "STUDENT"});
    //locate "My Account" in the header and click on it
    const header = await screen.findByTestId("header");
    const myAccount = within(header).getByRole("link", { name: "MY ACCOUNT" });
    await userEvent.click(myAccount);
    // wait for My Account page to load then click on the "Account Security" tab
    const accountSecurityTab = await screen.findByText(/account security/i);
    await userEvent.click(accountSecurityTab);
    // Find the Save button and check that it is currently disabled
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
    // Find the current password field and enter a password
    const currentPasswordField = screen.getByLabelText("Current password");
    await userEvent.type(currentPasswordField, invalidPassword);
    // Find the new password field and enter a password
    const newPasswordField = screen.getByLabelText("New password");
    await userEvent.type(newPasswordField, invalidPassword);
    // Find the confirm password field and enter a password
    const confirmPasswordField = screen.getByLabelText("Re-enter new password");
    await userEvent.type(confirmPasswordField, invalidPassword);
    const errorMessage = getById("passwordConfirmationValidationMessage")
    expect(saveButton).toBeDisabled();
    expect(errorMessage).toHaveTextContent(invalidPasswordError);
  });
});


