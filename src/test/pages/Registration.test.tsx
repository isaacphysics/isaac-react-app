import { screen, within } from "@testing-library/react";
import { renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";

describe("Registration", () => {
  it.each([
    ["Student", "register/student"],
    ["Teacher", "register/teacher"],
  ])("redirects to relevant Registration page when selecting %s then pressing submit", async (option, expectedUrl) => {
    renderTestEnvironment({ role: "ANONYMOUS" });
    // Locate "Sign Up" in the header and click on it
    const header = await screen.findByTestId("header");
    const signUp = within(header).getByRole("link", { name: "SIGN UP" });
    await userEvent.click(signUp);
    // Wait for Sign Up page to load and check that the page title is correct
    const title = screen.getByRole("heading", {
      name: "Register for a free account",
    });
    expect(title).toBeInTheDocument();
    // Locate the radio button for teacher or student and click on it
    const radioButton = screen.getByLabelText(option);
    await userEvent.click(radioButton);
    // Locate the "Submit" button and click on it
    const submitButton = screen.getByRole("button", { name: "Continue" });
    await userEvent.click(submitButton);
    // Wait for the corresponding registration page to load and check that the URL is correct
    expect(window.location.href).toContain(expectedUrl);
  });

  it("shows an error when selecting neither Student nor Teacher and pressing submit", async () => {
    renderTestEnvironment({ role: "ANONYMOUS" });
    // Locate "Sign Up" in the header and click on it
    const header = await screen.findByTestId("header");
    const signUp = within(header).getByRole("link", { name: "SIGN UP" });
    await userEvent.click(signUp);
    // Wait for Sign Up page to load and check that the page title is correct
    const title = screen.getByRole("heading", {
      name: "Register for a free account",
    });
    expect(title).toBeInTheDocument();
    // Locate the "Submit" button and click on it
    const submitButton = screen.getByRole("button", { name: "Continue" });
    await userEvent.click(submitButton);
    // Check that the error message is displayed
    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent("Please select an option.");
  });
});
