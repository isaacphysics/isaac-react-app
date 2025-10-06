import {FormFeedback, FormGroup, Label} from "reactstrap";
import React, {useEffect, useMemo, useState} from "react";
import {
    isAda,
    isPhy,
    loadZxcvbnIfNotPresent,
    MINIMUM_PASSWORD_LENGTH,
    passwordDebounce,
    validatePassword
} from "../../../services";
import {Immutable} from "immer";
import {PasswordFeedback, ValidationUser} from "../../../../IsaacAppTypes";
import {TogglablePasswordInput} from "./TogglablePasswordInput";

interface SetPasswordInputProps {
    className?: string;
    password?: string | null;
    onChange: (password: string) => void;
    onValidityChange: (valid: boolean) => void;
    submissionAttempted: boolean;
    idPrefix?: string;
    required: boolean;
}


export const SetPasswordInput = ({
    className,
    password,
    onChange,
    onValidityChange,
    required,
    submissionAttempted,
    idPrefix="account"
}: SetPasswordInputProps) => {
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);
    const [confirmationPassword, setConfirmationPassword] = useState<string | null>(null);

    const confirmed = isAda || (password === confirmationPassword);
    const valid = !!password && validatePassword(password) && confirmed;

    loadZxcvbnIfNotPresent();

    useEffect(() => {
        onValidityChange(valid);
    }, [onValidityChange, valid]);

    return <div className={className}>
        <FormGroup className="form-group">
            <Label htmlFor={`${idPrefix}-password-set`} className={"fw-bold form-required"}>Password</Label>
            <p className="d-block input-description">Your password must be at least {MINIMUM_PASSWORD_LENGTH} characters long.</p>
            <TogglablePasswordInput
                id={`${idPrefix}-password-set`} name="password" type="password"
                aria-describedby="invalidPassword"
                feedbackText={(!valid || confirmed) ? `Passwords must be at least ${MINIMUM_PASSWORD_LENGTH} characters long.` : "Please ensure your passwords match."}
                value={password as string | undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange(e.target.value);
                    passwordDebounce(e.target.value, setPasswordFeedback);
                }}
                invalid={required && submissionAttempted && !(valid && confirmed)}
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
                disabled={!required && submissionAttempted || !password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmationPassword(e.target.value);
                }}
            />
            <FormFeedback>
                Passwords must match and be at least {MINIMUM_PASSWORD_LENGTH} characters long.
            </FormFeedback>
        </FormGroup>}
    </div>;
};
