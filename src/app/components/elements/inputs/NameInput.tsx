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

export const LastNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup className={className}>
        <Label htmlFor="last-name-input" className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}>Last name</Label>
        <Input
            id="last-name-input"
            type="text"
            name="last-name"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {familyName: e.target.value} : {familyName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.familyName}
            aria-describedby="lastNameValidationMessage"
        />
        <FormFeedback id="lastNameValidationMessage">
            Please enter a valid name.
        </FormFeedback>
    </FormGroup>
}

export const FirstNameInput = ({className, userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup className={className}>
        <Label className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}
               htmlFor="first-name-input">First name</Label>
        <Input
            id="first-name-input"
            name="givenName"
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {givenName: e.target.value} : {givenName: null}))
            }
            invalid={submissionAttempted && !nameValid}
            defaultValue={userToUpdate.givenName}
            aria-describedby="firstNameValidationMessage"
        />
        <FormFeedback id="firstNameValidationMessage">
            Please enter a valid name.
        </FormFeedback>
    </FormGroup>
}