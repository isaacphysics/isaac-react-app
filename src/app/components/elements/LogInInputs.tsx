import React, {useEffect, useRef, useState} from 'react';
import {
    resetPassword,
    submitTotpChallengeResponse,
    useAppDispatch
} from "../../state";
import {
    Button,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from "reactstrap";
import {MINIMUM_PASSWORD_LENGTH} from "../../services";
import { Link } from 'react-router-dom';

// Handles display and logic of the two-factor authentication form (usually shown after the first login step)
export const TFAInput = React.forwardRef(function TFAForm({rememberMe}: {rememberMe: boolean}, ref: React.Ref<HTMLHeadingElement>) {
    const dispatch = useAppDispatch();
    const [mfaVerificationCode, setMfaVerificationCode] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            window.requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, []);

    return <>
        <h3 ref={ref} tabIndex={-1}>Two-Factor Authentication</h3>
        <p>Two-factor authentication has been enabled for this account.</p>
        <FormGroup className="form-group">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
                id="verification-code" type="text" name="verification-code" placeholder="Verification code"
                innerRef={inputRef}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMfaVerificationCode(e.target.value)
                }
                invalid={isNaN(Number(mfaVerificationCode))}
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
            />
            <FormFeedback id="verification-code-validation-message">
                {isNaN(Number(mfaVerificationCode)) && "Please enter a valid verification code"}
            </FormFeedback>
        </FormGroup>
        <FormGroup className="form-group">
            <Button
                id="submit-verification-code"
                tag="input" value="Verify"
                color="secondary" type="submit" className="mb-2" block
                disabled={isNaN(Number(mfaVerificationCode))}
                onClick={(event) => {
                    event.preventDefault();
                    if (mfaVerificationCode)
                        void dispatch(submitTotpChallengeResponse(mfaVerificationCode, rememberMe));
                }}
            />
        </FormGroup>
    </>;
});

// Component handling the display of "Forgotten your password?" and its relevant interactions
export const PasswordResetButton = ({email, isValidEmail, setPasswordResetAttempted, small}: {email: string, isValidEmail: boolean, setPasswordResetAttempted: (b: boolean) => void, small?: boolean}) => {
    const dispatch = useAppDispatch();
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    const attemptPasswordReset = () => {
        setPasswordResetAttempted(true);
        if (isValidEmail) {
            void dispatch(resetPassword({email: email}));
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    return !passwordResetRequest ?
        <div className={"d-flex justify-content-end " + (small ? "mt-1 w-100 text-end" : "")}>
            <Button className="text-end" color="link" onClick={attemptPasswordReset}>
                {small ? <small>Forgotten your password?</small> : "Forgotten your password?"}
            </Button>
        </div>
        :
        <p className={"mt-1"}>
            <strong id="password-reset-processing" className="d-block">
                Your password reset request is being processed.{small && " Please check your inbox."}
            </strong>
            {!small && <strong>
                Please check your inbox.
            </strong>}
        </p>;
};

export const SsoHelpLink = () => 
    <Link className="justify-content-end d-flex" to="/pages/single_sign_on" target='_blank'>
        Learn more about Single Sign-On
    </Link>;

interface EmailPasswordInputsProps {
    setEmail: (email: string) => void;
    setPassword: (pass: string) => void;
    validEmail: boolean;
    validPassword: boolean;
    logInAttempted: boolean;
    passwordResetAttempted: boolean;
    errorMessage: string | null;
    displayLabels?: boolean;
}
export const EmailPasswordInputs =({setEmail, setPassword, validEmail, validPassword, logInAttempted, passwordResetAttempted, errorMessage, displayLabels = true}: EmailPasswordInputsProps) => {
    return <>
        <div className="form-group">
            {displayLabels && <Label htmlFor="email-input">Email address</Label>}
            <Input
                id="email-input" type="email" name="email" placeholder="Email address"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                invalid={!!errorMessage || (!validEmail && (logInAttempted || passwordResetAttempted))}
                aria-describedby="emailValidationMessage"
                required
            />
            <FormFeedback id="emailValidationMessage">
                {!validEmail && "Please enter a valid email address"}
            </FormFeedback>
        </div>

        <div className="form-group mb-0">
            {displayLabels && <Label htmlFor="password-input">Password</Label>}
            <Input
                id="password-input" type="password" name="password" placeholder="Password"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                invalid={!!errorMessage || (!validPassword && (logInAttempted))}
                aria-describedby="passwordValidationMessage"
                required
            />
            <FormFeedback id="passwordValidationMessage">
                {!validPassword && `Passwords must be at least ${MINIMUM_PASSWORD_LENGTH} characters long`}
            </FormFeedback>
        </div>
    </>;
};
