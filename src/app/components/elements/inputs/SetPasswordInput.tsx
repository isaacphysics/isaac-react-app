import {FormFeedback, FormGroup, Label} from "reactstrap";
import React, {useState} from "react";
import {isPhy, loadZxcvbnIfNotPresent, MINIMUM_PASSWORD_LENGTH, passwordDebounce} from "../../../services";
import {Immutable} from "immer";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {TogglablePasswordInput} from "./TogglablePasswordInput";

interface SetPasswordInputProps {
    className?: string;
    userToUpdate: Immutable<ValidationUser>;
    setUserToUpdate: (user: Immutable<ValidationUser>) => void;
    passwordValid: boolean;
    setConfirmedPassword: (password: string) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}


export const SetPasswordInput = ({className, userToUpdate, setUserToUpdate, submissionAttempted, passwordValid, setConfirmedPassword, required, idPrefix="account"}: SetPasswordInputProps) => {
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    loadZxcvbnIfNotPresent();

    return <div className={className}>
        <FormGroup className="form-group">
            <Label htmlFor={`${idPrefix}-password-set`} className={"fw-bold form-required"}>Password</Label>
            <p className="d-block input-description">Your password must be at least {MINIMUM_PASSWORD_LENGTH} characters long.</p>
            <TogglablePasswordInput
                id={`${idPrefix}-password-set`} name="password" type="password"
                required aria-describedby="invalidPassword"
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

        {isPhy && <FormGroup className="form-group">
            <Label htmlFor="password-confirm">
                Re-enter password
            </Label>
            <TogglablePasswordInput
                id="password-confirm" name="password-confirm" type="password"
                disabled={!required && submissionAttempted || !userToUpdate.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmedPassword(e.target.value);
                }}
            />
            <FormFeedback>
                Passwords must match and be at least {MINIMUM_PASSWORD_LENGTH} characters long.
            </FormFeedback>
        </FormGroup>}
    </div>
}
