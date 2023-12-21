import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React, {ChangeEvent} from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface NameInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    nameValid: boolean;
    submissionAttempted: boolean;
    required: boolean;
}

export const LastNameInput = ({userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup>
        <Label htmlFor="last-name-input" className={classNames({"form-optional": !required}, "font-weight-bold")}>Last name</Label>
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

export const FirstNameInput = ({userToUpdate, setUserToUpdate, nameValid, submissionAttempted, required}: NameInputProps) => {
    return <FormGroup>
        <Label className={classNames({"form-optional": !required}, "font-weight-bold")}
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