import {Button, CardBody, Col, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import React, {useState} from "react";
import {LoggedInUser, ValidationUser} from "../../../IsaacAppTypes";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {MINIMUM_PASSWORD_LENGTH, validateEmail, validatePassword} from "../../services/validation";
import {resetPassword} from "../../state/actions";

interface UserPasswordProps {
    currentUserEmail?: string;
    setCurrentPassword: (e: any) => void;
    myUser: ValidationUser;
    setMyUser: (e: any) => void;
    isNewPasswordConfirmed: boolean;
    setIsNewPasswordConfirmed: (isValid: boolean) => void;
    authSettings: UserAuthenticationSettingsDTO | null;
}

export const UserPassword = (
    {currentUserEmail, setCurrentPassword, myUser, setMyUser, isNewPasswordConfirmed, setIsNewPasswordConfirmed, authSettings}: UserPasswordProps) => {
    const [newPassword, setNewPassword] = useState("");
    const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);

    const [passwordResetRequested, setPasswordResetRequested] = useState(false);

    const validateNewPasswordsMatch = (newPassword: string, newPasswordCopy: string) => {
        return newPassword === newPasswordCopy;
    };

    const resetPasswordIfValidEmail = () => {
        if (currentUserEmail && validateEmail(currentUserEmail)) {
            resetPassword({email: currentUserEmail});
            setPasswordResetRequested(true);
        }
    };

    return <CardBody>
        {authSettings && authSettings.hasSegueAccount ?
            <div>
                <Col>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="password-current">Current Password</Label>
                            <Input
                                id="password-current" type="password" name="current-password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                            />
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                invalid={!!newPassword && !isNewPasswordValid}
                                id="new-password" type="password" name="new-password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newPassword = e.target.value;
                                    setIsNewPasswordValid(validatePassword(newPassword));
                                    setNewPassword(newPassword);
                                }}
                                aria-describedby="passwordValidationMessage"
                            />
                            {newPassword && !isNewPasswordValid &&
                                <FormFeedback id="passwordValidationMessage">
                                    {`Passwords must be at least ${MINIMUM_PASSWORD_LENGTH} characters long`}
                                </FormFeedback>
                            }
                        </FormGroup>
                    </Row>
                    <Row>
                        <FormGroup>
                            <Label htmlFor="password-confirm">Re-enter New Password</Label>
                            <Input
                                invalid={isNewPasswordValid && !isNewPasswordConfirmed}
                                id="password-confirm"
                                type="password" name="password-confirmation"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const newPasswordCopy = e.target.value;
                                    if (isNewPasswordValid && validateNewPasswordsMatch(newPassword, newPasswordCopy)) {
                                        setMyUser(Object.assign(myUser, {password: newPasswordCopy}))
                                        setIsNewPasswordConfirmed(true);
                                    } else {
                                        setIsNewPasswordConfirmed(false);
                                    }
                                }} aria-describedby="passwordConfirmationValidationMessage"
                            />
                            {isNewPasswordValid && !isNewPasswordConfirmed &&
                                <FormFeedback id="passwordConfirmationValidationMessage">
                                    New passwords do not match
                                </FormFeedback>
                            }
                        </FormGroup>
                    </Row>
                </Col>
            </div> :
            !passwordResetRequested ?
                <div className="text-center">
                    {authSettings && authSettings.linkedAccounts &&
                    <p>
                        You do not currently have a password set for this account; you
                        sign in using
                        {(authSettings.linkedAccounts).map((linked, index) => {
                            return <span key={index} className="text-capitalize">{linked.toLowerCase()}</span>;
                        })}.
                    </p>
                    }
                    <Button className="btn-secondary" onClick={resetPasswordIfValidEmail}>
                        Click here to add a password
                    </Button>
                </div> :
                <p>
                    <strong className="d-block">Your password reset request is being processed.</strong>
                    <strong className="d-block">Please check your inbox.</strong>
                </p>
        }
    </CardBody>
};
