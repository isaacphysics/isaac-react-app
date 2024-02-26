import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React, {ChangeEvent} from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface NameInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    nameValid: boolean;
    submissionAttempted: boolean;
    required: boolean;
}

export const FamilyNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup className={className}>
        <Label htmlFor="family-name-input" className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}>Last name</Label>
        <Input
            id="family-name-input"
            type="text"
            name="last-name"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {familyName: e.target.value} : {familyName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.familyName}
            aria-describedby="familyNameValidationMessage"
        />
        <FormFeedback id="familyNameValidationMessage">
            Please enter a valid name.
        </FormFeedback>
    </FormGroup>
}

export const GivenNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup className={className}>
        <Label className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}
               htmlFor="given-name-input">First name</Label>
        <Input
            id="given-name-input"
            name="givenName"
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {givenName: e.target.value} : {givenName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.givenName}
            aria-describedby="givenNameValidationMessage"
        />
        <FormFeedback id="givenNameValidationMessage">
            Please enter a valid name.
        </FormFeedback>
    </FormGroup>
}