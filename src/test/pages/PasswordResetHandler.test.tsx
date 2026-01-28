import {renderTestEnvironment, setUrl} from "../testUtils";
import {handlerThatReturns} from "../../mocks/handlers";
import {API_PATH, isPhy} from "../../app/services";
import {http} from "msw";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";


async function enterAndConfirmPassword(password: string) {
    const passwordInput = await screen.findByLabelText("New password");
    await userEvent.type(passwordInput, password);

    if (isPhy) {
        // Confirmation is only required on Isaac Science
        const confirmInput = await screen.findByLabelText("Re-enter password");
        await userEvent.type(confirmInput, password);
    }
}

async function assertFeedbackShown(feedback: string) {
    const e = await screen.findByText(feedback);
    expect(e).toBeInTheDocument();
}

async function assertInvalidTokenWarningShown(assert: boolean) {
    const isInvalidTokenWarningShown = await screen.findByText("Invalid password reset token.")
        .then(() => true)
        .catch(() => false);
    expect(isInvalidTokenWarningShown).toBe(assert);
}

async function assertSuccessToastShown(assert: boolean) {
    const isSuccessToastShown = await screen.findByText("Password reset successful")
        .then(() => true)
        .catch(() => false);
    expect(isSuccessToastShown).toBe(assert);
}

describe('PasswordResetHandler', () => {
    it("should allow submission when token and password are valid and password confirmed", async () => {
        // Arrange
        await renderTestEnvironment({
            role: 'ANONYMOUS',
            extraEndpoints: [
                http.get(API_PATH + '/users/resetpassword/some_valid_token', handlerThatReturns({
                    data: {},
                    status: 200
                })),
                http.post(API_PATH + '/users/resetpassword/some_valid_token', handlerThatReturns({
                    data: {},
                    status: 200
                }))
            ]
        });

        // Act
        // Navigate to reset page
        await setUrl({ pathname: "resetpassword/some_valid_token" });

        // Enter and confirm new password, then submit
        await enterAndConfirmPassword("validnewpassword");

        const submitButton = await screen.findByRole("button", {name: "Change password"});
        await userEvent.click(submitButton);

        // Assert
        expect(submitButton).toBeEnabled();
        await assertInvalidTokenWarningShown(false);
        await assertSuccessToastShown(true);
    });

    it("should disable submit button and prevent submission when token is invalid", async () => {
        // Arrange
        await renderTestEnvironment({
            role: 'ANONYMOUS',
            extraEndpoints: [
                http.get(API_PATH + '/users/resetpassword/some_invalid_token', handlerThatReturns(
                    {
                        data: {
                            "responseCode": 404,
                            "responseCodeType": "Not Found",
                            "errorMessage": "Invalid password reset token.",
                            "bypassGenericSiteErrorPage": false
                        },
                        status: 404
                    }
                )),
            ]
        });

        // Act
        // Navigate to reset page
        await setUrl({ pathname: "resetpassword/some_invalid_token" });

        // Enter and confirm new password, then attempt to submit (even though we expect the button to be disabled)
        await enterAndConfirmPassword("validnewpassword");

        const submitButton = await screen.findByRole("button", {name: "Change password"});
        await userEvent.click(submitButton);

        // Assert
        expect(submitButton).toBeDisabled();
        await assertInvalidTokenWarningShown(true);
        await assertSuccessToastShown(false);
    });

    it("should show invalid password feedback if password is invalid", async () => {
        // Arrange
        await renderTestEnvironment({
            role: 'ANONYMOUS',
            extraEndpoints: [
                http.get(API_PATH + '/users/resetpassword/some_valid_token', handlerThatReturns({
                    data: {},
                    status: 200
                })),
            ]
        });

        // Act
        // Navigate to reset page
        await setUrl({ pathname: "resetpassword/some_valid_token" });

        // Enter new password, then attempt to submit
        const passwordInput = await screen.findByLabelText("New password");
        await userEvent.type(passwordInput, "2short");

        const submitButton = await screen.findByRole("button", {name: "Change password"});
        await userEvent.click(submitButton);

        // Assert
        // Feedback is shown
        await assertFeedbackShown("Passwords must be at least 8 characters long.");

        if(isPhy) {
            // Confirmation field is disabled until password is valid
            const confirmInput = await screen.findByLabelText("Re-enter password");
            expect(confirmInput).toBeDisabled();
        }

        await assertSuccessToastShown(false);
    });

    if(isPhy) {
        it("should show password confirmation feedback if passwords do not match", async () => {
            await renderTestEnvironment({
                role: 'ANONYMOUS',
                extraEndpoints: [
                    http.get(API_PATH + '/users/resetpassword/some_valid_token', handlerThatReturns({
                        data: {},
                        status: 200
                    })),
                ]
            });

            // Act
            // Navigate to reset page
            await setUrl({ pathname: "resetpassword/some_valid_token" });

            // Enter new password, then attempt to submit
            const passwordInput = await screen.findByLabelText("New password");
            await userEvent.type(passwordInput, "validnewpassword");

            const confirmInput = await screen.findByLabelText("Re-enter password");
            await userEvent.type(confirmInput, "val1dnewpassword");

            const submitButton = await screen.findByRole("button", {name: "Change password"});
            await userEvent.click(submitButton);

            // Assert
            // Feedback is shown
            await assertFeedbackShown("Please ensure your passwords match.");
            await assertSuccessToastShown(false);
        });
    }
});

