import { Immutable } from "immer";
import React from "react";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { ValidationUser } from "../../../../IsaacAppTypes";
import { allowedDomain, validateEmail } from "../../../services";

interface EmailInputProps {
  submissionAttempted: boolean;
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate: (user: Immutable<ValidationUser>) => void;
  emailDefault?: string;
  teacherRegistration?: true;
}

export const EmailInput = ({
  submissionAttempted,
  userToUpdate,
  setUserToUpdate,
  emailDefault,
  teacherRegistration,
}: EmailInputProps) => {
  const emailIsValid = userToUpdate.email && validateEmail(userToUpdate.email);

  return (
    <FormGroup>
      <Label htmlFor="email-input">Email address</Label>
      <Input
        id="email-input"
        name="email"
        type="email"
        autoComplete="email"
        aria-describedby="email-validation-feedback"
        required
        defaultValue={emailDefault}
        invalid={submissionAttempted && !emailIsValid}
        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
          setUserToUpdate({ ...userToUpdate, email: e.target.value });
        }}
      />
      <FormFeedback id="email-validation-feedback" className="always-show">
        {submissionAttempted && !emailIsValid && "Enter a valid email address"}
        {submissionAttempted &&
          teacherRegistration === true &&
          !allowedDomain(userToUpdate.email) &&
          "Not a valid email address for a teacher account"}
      </FormFeedback>
    </FormGroup>
  );
};
