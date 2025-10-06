import React, {useEffect, useState} from 'react';
import {AppState, handlePasswordReset, useAppDispatch, useAppSelector, verifyPasswordReset} from "../../state";
import {Button, Card, CardBody, CardFooter, Container, Form, FormFeedback, FormGroup, Input, Label} from "reactstrap";
import {PasswordFeedback} from "../../../IsaacAppTypes";
import {
    isAda,
    isPhy,
    loadZxcvbnIfNotPresent,
    MINIMUM_PASSWORD_LENGTH,
    passwordDebounce,
    validatePassword
} from "../../services";
import {RouteComponentProps} from "react-router";
import { extractErrorMessage } from '../../services/errors';
import {TogglablePasswordInput} from "../elements/inputs/TogglablePasswordInput";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";


export const ResetPasswordHandler = ({match}: RouteComponentProps<{token?: string}>) => {
    const dispatch = useAppDispatch();
    const urlToken = match.params.token || null;

    const [newPassword, setNewPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");

    const passwordIsValid = validatePassword(newPassword);
    const passwordsMatch = (isAda || confirmationPassword === newPassword);

    useEffect(() => {dispatch(verifyPasswordReset(urlToken));}, [dispatch, urlToken]);

    return <Container id="email-verification">
        <div>
            <h3>Reset your password</h3>
            <Card>
                <CardBody>
                    <Form name="passwordReset">
                        <SetPasswordInput
                            className="my-4"
                            onChange={setNewPassword}
                            // passwordValid={passwordIsValid}
                            // passwordsMatch={passwordsMatch}
                            // setConfirmedPassword={setConfirmationPassword}
                            submissionAttempted={false} // todo
                            required={true} onConfirmationChange={function (confirmed: boolean): void {
                                throw new Error('Function not implemented.');
                            }} onValidityChange={function (valid: boolean): void {
                                throw new Error('Function not implemented.');
                            }}                        />
                    </Form>
                </CardBody>
                <CardFooter>
                    <Button color="secondary" className="mb-2" block id="change-password">
                        Change Password
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </Container>;
};
