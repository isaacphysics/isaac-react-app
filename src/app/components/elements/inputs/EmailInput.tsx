import {FormFeedback, FormGroup, Input, Label} from "reactstrap";
import React from "react";
import {Immutable} from "immer";
import {ValidationUser} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isAda, isTeacherOrAbove} from "../../../services";

interface EmailInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    submissionAttempted: boolean;
    emailIsValid: boolean;
    required: boolean;
}

export const EmailInput = ({className, userToUpdate, setUserToUpdate, emailIsValid, submissionAttempted, required}: EmailInputProps) => {
    return <FormGroup className={className}>
        <Label className={classNames("font-weight-bold", (required ? "form-required" : "form-optional"))}
               htmlFor="email-input">Email address</Label>
        {isAda &&
                <p className="d-block input-description">
                    {isTeacherOrAbove(userToUpdate) ?
                        "This will be visible to your students. We recommend using your school email address."
                        :
                        "This will be the email address you use to log in."
                    }
                </p>
        }
        <Input
            id="email-input"
            type="text"
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
    </FormGroup>;
};