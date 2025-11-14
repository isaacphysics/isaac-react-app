import React, { useEffect, useState } from "react";
import { AppState, handlePasswordReset, useAppDispatch, useAppSelector, verifyPasswordReset } from "../../state";
import { Button, Card, CardBody, CardFooter, Container, Form, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { RouteComponentProps } from "react-router";
import {
  validatePassword,
  getPasswordValidationErrors,
  loadZxcvbnIfNotPresent,
  PASSWORD_REQUIREMENTS,
} from "../../services";

export const ResetPasswordHandler = ({ match }: RouteComponentProps<{ token?: string }>) => {
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector((state: AppState) => state?.error || null);
  const urlToken = match.params.token || null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  loadZxcvbnIfNotPresent();

  useEffect(() => {
    dispatch(verifyPasswordReset(urlToken));
  }, [dispatch, urlToken]);

  // Validate password whenever it changes
  useEffect(() => {
    if (passwordTouched && password) {
      // Using the proper validation function that checks for 12+ chars and all requirements
      const isValid = validatePassword(password);

      if (isValid) {
        setPasswordErrors([]);
      } else {
        // Get specific errors if using the enhanced module8
        const errors = getPasswordValidationErrors ? getPasswordValidationErrors(password) : [PASSWORD_REQUIREMENTS];
        setPasswordErrors(errors);
      }
    } else if (passwordTouched && !password) {
      setPasswordErrors(["Password is required"]);
    }
  }, [password, passwordTouched]);

  // Validate password confirmation whenever either password changes
  useEffect(() => {
    if (confirmPasswordTouched) {
      if (!confirmPassword) {
        setConfirmPasswordError("Please confirm your password");
      } else if (password === confirmPassword) {
        setConfirmPasswordError("");
      } else {
        setConfirmPasswordError("Passwords do not match");
      }
    }
  }, [password, confirmPassword, confirmPasswordTouched]);

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      validatePassword(password) &&
      password === confirmPassword &&
      passwordErrors.length === 0 &&
      !confirmPasswordError
    );
  };

  // Handle form submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Touch all fields to show any errors
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (isFormValid() && !errorMessage && urlToken) {
      dispatch(handlePasswordReset({ token: urlToken, password: password }));
    }
  };

  function getDisabledButtonMessage(): string {
    if (!password) return "Please enter a password";
    if (!confirmPassword) return "Please confirm your password";
    if (passwordErrors.length > 0) return "Please fix password errors";
    if (confirmPasswordError) return "Passwords must match";
    return "Please complete all fields";
  }

  return (
    <Container id="password-reset">
      <div>
        <h3>Password Reset</h3>
        <Card>
          <CardBody>
            <Form name="passwordReset" onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password-new"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordTouched(true)}
                  invalid={passwordTouched && passwordErrors.length > 0}
                  aria-describedby="password-requirements password-errors"
                  required
                />

                {/* Show password requirements */}
                <small id="password-requirements" className="form-text text-muted">
                  {PASSWORD_REQUIREMENTS}
                </small>

                {/* Show specific validation errors */}
                {passwordTouched && passwordErrors.length > 0 && (
                  <div id="password-errors" className="invalid-feedback d-block">
                    {passwordErrors.map((error) => (
                      <div key={error}>{error}</div>
                    ))}
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password-confirm">Re-enter new password</Label>
                <Input
                  id="password-confirm"
                  type="password"
                  name="password-new-confirm"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  invalid={confirmPasswordTouched && !!confirmPasswordError}
                  aria-describedby="confirm-password-error"
                  required
                />
                {confirmPasswordTouched && confirmPasswordError && (
                  <FormFeedback id="confirm-password-error">{confirmPasswordError}</FormFeedback>
                )}
              </FormGroup>
            </Form>
          </CardBody>

          <CardFooter>
            {/* Show general errors from the API */}
            {errorMessage?.type === "generalError" && (
              <h4 role="alert" className="text-danger text-center mb-3">
                {errorMessage.generalError}
              </h4>
            )}

            <Button
              color="primary"
              className="mb-2"
              block
              onClick={handleSubmit}
              disabled={!isFormValid()}
              id="change-password"
            >
              Reset Password
            </Button>

            {/* Show why button is disabled */}
            {(!password || !confirmPassword || !isFormValid()) && (
              <small className="text-muted text-center d-block">{getDisabledButtonMessage()}</small>
            )}
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
};
