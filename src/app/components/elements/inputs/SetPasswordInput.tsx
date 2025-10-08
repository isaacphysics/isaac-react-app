import {FormFeedback, FormGroup, Label} from "reactstrap";
import React, {useEffect, useState} from "react";
import {
    isAda,
    isPhy,
    loadZxcvbnIfNotPresent,
    MINIMUM_PASSWORD_LENGTH,
    passwordDebounce,
    validatePassword
} from "../../../services";
import {PasswordFeedback} from "../../../../IsaacAppTypes";
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
    const [isValid, setIsValid] = useState(false);
    const [strengthFeedback, setStrengthFeedback] = useState<PasswordFeedback | null>(null);
    const [confirmation, setConfirmation] = useState<string | null>(null);

    const isConfirmed = isAda || (password === confirmation);

    loadZxcvbnIfNotPresent();

    useEffect(() => {
        onValidityChange(isValid && isConfirmed);
    }, [onValidityChange, isValid, isConfirmed]);

    return <div className={className}>
        <FormGroup className="form-group">
            <Label htmlFor={`${idPrefix}-password-set`} className={"fw-bold form-required"}>Password</Label>
            <p className="d-block input-description">Your password must be at least {MINIMUM_PASSWORD_LENGTH} characters long.</p>
            <TogglablePasswordInput
                id={`${idPrefix}-password-set`} name="password" type="password"
                data-testid={`${idPrefix}-password-set`}
                aria-describedby="invalidPassword"
                feedbackText={`Passwords must be at least ${MINIMUM_PASSWORD_LENGTH} characters long.`}
                value={password as string | undefined}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange(e.target.value);
                    setIsValid(validatePassword(e.target.value));
                    passwordDebounce(e.target.value, setStrengthFeedback);
                }}
                invalid={required && submissionAttempted && !isValid}
            />
            {strengthFeedback &&
                <span className='float-end small mt-1'>
                    <strong>Password strength: </strong>
                    <span id="password-strength-feedback">
                        {strengthFeedback.feedbackText}
                    </span>
                </span>
            }
        </FormGroup>

        {isPhy && <FormGroup className="form-group">
            <Label className={"fw-bold form-required"} htmlFor={`${idPrefix}-password-confirm`}>
                Re-enter password
            </Label>
            <TogglablePasswordInput
                id={`${idPrefix}-password-confirm`} name="password-confirm" type="password"
                data-testid={`${idPrefix}-password-confirm`}
                disabled={!isValid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfirmation(e.target.value);
                }}
                feedbackText={"Please ensure your passwords match."}
                invalid={submissionAttempted && isValid && !isConfirmed}
            />
        </FormGroup>}
    </div>;
};
