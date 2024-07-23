import {FormGroup, Label} from "reactstrap";
import React, {useState} from "react";
import {loadZxcvbnIfNotPresent, passwordDebounce} from "../../../services";
import {Immutable} from "immer";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {TogglablePasswordInput} from "./TogglablePasswordInput";

interface SetPasswordInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    passwordValid: boolean;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}


export const SetPasswordInput = ({className, userToUpdate, setUserToUpdate, submissionAttempted, passwordValid, required, idPrefix="account"}: SetPasswordInputProps) => {

    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    loadZxcvbnIfNotPresent();

    return <FormGroup className={`form-group ${className}`}>
        <Label htmlFor={`${idPrefix}-password-set`} className={"fw-bold"}>Password</Label>
        <p className="d-block input-description">Your password must be at least 8 characters.</p>
        <TogglablePasswordInput
            id={`${idPrefix}-password-set`}
            value={userToUpdate.password ? userToUpdate.password : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUserToUpdate(Object.assign({}, userToUpdate, e.target.value ? {password: e.target.value} : {password: null}))
                passwordDebounce(e.target.value, setPasswordFeedback);
            }}
            invalid={required && submissionAttempted && !passwordValid}
        />
        {passwordFeedback &&
            <span className='float-end small mt-1'>
                <strong>Password strength: </strong>
                <span id="password-strength-feedback">
                    {passwordFeedback.feedbackText}
                </span>
            </span>
        }
    </FormGroup>
}
