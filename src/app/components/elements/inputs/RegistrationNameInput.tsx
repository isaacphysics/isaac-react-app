import { Immutable } from "immer";
import React from "react";
import { Col, FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { ValidationUser } from "../../../../IsaacAppTypes";
import { validateName } from "../../../services";

interface RegistrationNameProps {
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate: (user: Immutable<ValidationUser>) => void;
  attemptedSignUp: boolean;
}

export const RegistrationNameInput = ({ userToUpdate, setUserToUpdate, attemptedSignUp }: RegistrationNameProps) => {
  const nameFields = [
    {
      label: "First name",
      name: "givenName",
      value: userToUpdate.givenName,
      isValid: validateName(userToUpdate.givenName),
    },
    {
      label: "Last name",
      name: "familyName",
      value: userToUpdate.familyName,
      isValid: validateName(userToUpdate.familyName),
    },
  ];

  return (
    <>
      {nameFields.map((each) => (
        <Col md={6} key={each.name}>
          <FormGroup>
            <Label htmlFor={`${each.name}-input`}>{each.label}</Label>
            <Input
              id={`${each.name}-input`}
              defaultValue={each.value}
              type="text"
              name={each.name}
              onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate({
                  ...userToUpdate,
                  [each.name]: e.target.value,
                });
              }}
              invalid={attemptedSignUp && !each.isValid}
              aria-describedby={`${each.name}ValidationMessage`}
              required
            />
            <FormFeedback id={`${each.name}ValidationMessage`}>
              {attemptedSignUp && !each.isValid ? "Enter a valid name" : null}
            </FormFeedback>
          </FormGroup>
        </Col>
      ))}
    </>
  );
};
