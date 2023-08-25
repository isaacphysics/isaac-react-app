import React, { useEffect } from "react";
import { CustomInput, FormFeedback, FormGroup, Label, Row } from "reactstrap";
import { DateInput } from "./DateInput";
import { Immutable } from "immer";
import { ValidationUser } from "../../../../IsaacAppTypes";
import { isDefined, isDobOverThirteen } from "../../../services";

interface RegistrationDobProps {
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate: (user: Immutable<ValidationUser>) => void;
  attemptedSignUp: boolean;
  dobOver13CheckboxChecked: boolean;
  setDobOver13CheckboxChecked: (checked: boolean) => void;
}

export const RegistrationDobInput = ({
  userToUpdate,
  setUserToUpdate,
  attemptedSignUp,
  dobOver13CheckboxChecked,
  setDobOver13CheckboxChecked,
}: RegistrationDobProps) => {
  const dobTooYoung =
    isDefined(userToUpdate.dateOfBirth) &&
    !isDobOverThirteen(userToUpdate.dateOfBirth);

  const confirmedOverThirteen =
    dobOver13CheckboxChecked || isDobOverThirteen(userToUpdate.dateOfBirth);

  const teacherRegistration = window.location.pathname.includes("/teacher");

  return (
    <FormGroup>
      <Label htmlFor="dob-input">Date of birth (optional)</Label>
      <Row className="ml-0">
        <DateInput
          id="dob-input"
          name="date-of-birth"
          invalid={dobTooYoung || (attemptedSignUp && !confirmedOverThirteen)}
          disableDefaults
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setUserToUpdate({
              ...userToUpdate,
              dateOfBirth:
                event.target.valueAsDate !== null
                  ? event.target.valueAsDate
                  : undefined,
            });
            // DOB takes priority over age confirmation
            setDobOver13CheckboxChecked(false);
          }}
          labelSuffix=" of birth"
        />
        {!teacherRegistration && (
          <CustomInput
            id="age-over-13-confirmation-input"
            name="age-over-13-confirmation"
            type="checkbox"
            className="larger-checkbox mt-3"
            checked={confirmedOverThirteen}
            required
            label="I am at least 13 years old"
            disabled={!!userToUpdate.dateOfBirth}
            onChange={(e) => setDobOver13CheckboxChecked(e?.target.checked)}
            invalid={dobTooYoung}
          />
        )}
      </Row>
      <FormFeedback id="dob-validation-feedback" className="always-show">
        {userToUpdate.dateOfBirth &&
          !confirmedOverThirteen &&
          (teacherRegistration
            ? "Please enter a valid date of birth."
            : "Please enter a valid date of birth or confirm you are over 13 years old.")}
      </FormFeedback>
    </FormGroup>
  );
};
