import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";

interface EmailInputProps {
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    emailIsValid: boolean;
    required: boolean;
}

export const EmailInput = ({userToUpdate, setUserToUpdate, emailIsValid, submissionAttempted, required}: EmailInputProps) => {
    return <FormGroup>
        <Label className={classNames({"form-optional": !required}, "font-weight-bold")}
               htmlFor="email-input">Email address</Label>
        <p className="d-block">This will be visible to your students. We recommend using your school email address.</p>
        <Input
            id="email-input"
            type="email"
            name="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {email: e.target.value} : {email: null}))
            }
            invalid={submissionAttempted && !emailIsValid}
            defaultValue={userToUpdate.email}
            aria-describedby="emailValidationMessage"
        />
        <FormFeedback id="emailValidationMessage">
            Please enter a valid email address.
        </FormFeedback>
    </FormGroup>
}