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
import { useTranslation } from "react-i18next";
import i18next from "i18next";

// Handles display and logic of the two-factor authentication form (usually shown after the first login step)
export const TFAInput = React.forwardRef(function TFAForm({rememberMe}: {rememberMe: boolean}, ref: React.Ref<HTMLHeadingElement>) {
    const { t } = useTranslation();
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
        <h2 className="h3" ref={ref} tabIndex={-1}>{t("common:auth.tfa.title")}</h2>
        <p>{t("common:auth.tfa.description")}</p>
        <FormGroup className="form-group">
            <Label htmlFor="verification-code">{t("common:auth.tfa.codeLabel")}</Label>
            <Input
                id="verification-code" type="text" name="verification-code" placeholder={t("common:auth.tfa.codePlaceholder")}
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
                {isNaN(Number(mfaVerificationCode)) && t("common:auth.tfa.codeInvalid")}
            </FormFeedback>
        </FormGroup>
        <FormGroup className="form-group">
            <Button
                id="submit-verification-code"
                tag="input" value={t("common:auth.tfa.verifyButton")}
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
    const { t } = useTranslation();
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
                {small ? <small>{t("common:auth.password.forgotten")}</small> : t("common:auth.password.forgotten")}
            </Button>
        </div>
        :
        <p className={"mt-1"}>
            <strong id="password-reset-processing" className="d-block">
                Your password reset request is being processed.{small && " Please check your inbox."}
            </strong>
            {!small && <strong>
                {t("common:auth.password.resetInbox")}
            </strong>}
        </p>;
};

export const SsoHelpLink = () => 
    <Link className="justify-content-end d-flex" to="/pages/single_sign_on" target='_blank'>
        {i18next.t("common:auth.sso.learnMore")}
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
    const { t } = useTranslation();
    return <>
        <div className="form-group">
            {displayLabels && <Label htmlFor="email-input">{t("common:auth.login.emailLabel")}</Label>}
            <Input
                id="email-input" type="email" name="email" placeholder={t("common:auth.login.emailPlaceholder")}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                invalid={!!errorMessage || (!validEmail && (logInAttempted || passwordResetAttempted))}
                aria-describedby="emailValidationMessage"
                required
            />
            <FormFeedback id="emailValidationMessage">
                {!validEmail && t("common:auth.login.emailInvalid")}
            </FormFeedback>
        </div>

        <div className="form-group mb-0">
            {displayLabels && <Label htmlFor="password-input">{t("common:auth.login.passwordLabel")}</Label>}
            <Input
                id="password-input" type="password" name="password" placeholder={t("common:auth.login.passwordPlaceholder")}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                invalid={!!errorMessage || (!validPassword && (logInAttempted))}
                aria-describedby="passwordValidationMessage"
                required
            />
            <FormFeedback id="passwordValidationMessage">
                {!validPassword && t("common:auth.login.passwordLength", { minLength: MINIMUM_PASSWORD_LENGTH })}
            </FormFeedback>
        </div>
    </>;
};
