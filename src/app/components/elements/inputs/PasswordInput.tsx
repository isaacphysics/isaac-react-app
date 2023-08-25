import React, { useState } from "react";
import {
  Col,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { PasswordFeedback, ValidationUser } from "../../../../IsaacAppTypes";
import { Immutable } from "immer";
import {
  PASSWORD_REQUIREMENTS,
  passwordDebounce,
  validatePassword,
} from "../../../services";
interface PasswordInputProps {
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate: (user: Immutable<ValidationUser>) => void;
  setUnverifiedPassword: (password: string) => void;
  submissionAttempted: boolean;
  unverifiedPassword: string | undefined;
  defaultPassword?: string;
}

export const PasswordInputs = ({
  userToUpdate,
  setUserToUpdate,
  submissionAttempted,
  unverifiedPassword,
  setUnverifiedPassword,
  defaultPassword,
}: PasswordInputProps) => {
  const [passwordFeedback, setPasswordFeedback] =
    useState<PasswordFeedback | null>(null);

  const passwordIsValid =
    userToUpdate.password == unverifiedPassword &&
    validatePassword(userToUpdate.password || "");

  return (
    <Row>
      <Col md={6}>
        <FormGroup>
          <Label htmlFor="password-input">Password</Label>
          <span id={`password-help-tooltip`} className="icon-help ml-1" />
          <UncontrolledTooltip
            target={`password-help-tooltip`}
            placement="bottom"
          >
            {PASSWORD_REQUIREMENTS}
          </UncontrolledTooltip>
          <Input
            id="password-input"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            defaultValue={defaultPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              passwordDebounce(e.target.value, setPasswordFeedback);
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUnverifiedPassword(e.target.value);
              passwordDebounce(e.target.value, setPasswordFeedback);
            }}
          />
          {passwordFeedback && (
            <span className="float-right small mt-1">
              <strong>Password strength: </strong>
              <span id="password-strength-feedback">
                {passwordFeedback.feedbackText}
              </span>
            </span>
          )}
        </FormGroup>
      </Col>
      <Col md={6}>
        <FormGroup>
          <Label htmlFor="password-confirm">Re-enter password</Label>
          <Input
            id="password-confirm"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-describedby="invalidPassword"
            disabled={!unverifiedPassword}
            invalid={submissionAttempted && !passwordIsValid}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUserToUpdate({ ...userToUpdate, password: e.target.value });
            }}
          />
          {/* Feedback that appears for password match before submission */}
          <FormFeedback id="invalidPassword" className="always-show">
            {userToUpdate.password &&
              (!(userToUpdate.password == unverifiedPassword)
                ? "Passwords don't match."
                : !validatePassword(userToUpdate.password || "") &&
                  PASSWORD_REQUIREMENTS)}
          </FormFeedback>
        </FormGroup>
      </Col>
    </Row>
  );
};