import React, { useState } from "react";
import {
  Col,
  FormFeedback,
  FormGroup,
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
import Password from "./Password";
interface PasswordInputProps {
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate: (user: Immutable<ValidationUser>) => void;
  setUnverifiedPassword: (password: string) => void;
  submissionAttempted: boolean;
  unverifiedPassword: string | undefined;
  defaultPassword?: string;
}

export const RegistrationPasswordInputs = ({
  userToUpdate,
  setUserToUpdate,
  submissionAttempted,
  unverifiedPassword,
  setUnverifiedPassword,
  defaultPassword,
}: PasswordInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordFeedback, setPasswordFeedback] =
    useState<PasswordFeedback | null>(null);

  const passwordIsValid =
    userToUpdate.password == unverifiedPassword &&
    validatePassword(userToUpdate.password || "");

  return (
    <Row>
      <Col md={6}>
        <FormGroup>
          <Label htmlFor="new-password">Password</Label>
          <span id={`password-help-tooltip`} className="icon-help ml-1" />
          <UncontrolledTooltip
            target={`password-help-tooltip`}
            placement="bottom"
          >
            {PASSWORD_REQUIREMENTS}
          </UncontrolledTooltip>
          <Password
            passwordFieldType="New"
            isPasswordVisible={isPasswordVisible}
            setIsPasswordVisible={setIsPasswordVisible}
            defaultValue={defaultPassword}
            onChange={(e) => {
              passwordDebounce(e.target.value, setPasswordFeedback);
            }}
            onBlur={(e) => {
              setUnverifiedPassword(e.target.value);
              passwordDebounce(e.target.value, setPasswordFeedback);
            }}
            showToggleIcon={true}
            required={true}
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
          <Password
            passwordFieldType="Confirm"
            isPasswordVisible={isPasswordVisible}
            setIsPasswordVisible={setIsPasswordVisible}
            disabled={!unverifiedPassword}
            invalid={submissionAttempted && !passwordIsValid}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUserToUpdate({ ...userToUpdate, password: e.target.value });
            }}
            ariaDescribedBy="invalidPassword"
            required={true}
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