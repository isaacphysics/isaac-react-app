import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {handlePasswordReset, verifyPasswordReset} from "../../state/actions";
import {Button, Card, CardBody, CardFooter, Container, Form, FormFeedback, FormGroup, Input, Label} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {ZxcvbnResult} from "../../../IsaacAppTypes";
import {loadZxcvbnIfNotPresent, passwordDebounce, passwordStrengthText} from "../../services/passwordStrength";

const stateToProps = (state: AppState, {match: {params: {token}}}: any) => ({
    errorMessage: state ? state.error : null,
    urlToken: token
});

const dispatchToProps = {
    handleResetPassword: handlePasswordReset,
    verifyPasswordReset: verifyPasswordReset
};

interface PasswordResetHandlerProps {
    urlToken: string;
    handleResetPassword: (params: {token: string | null; password: string | null}) => void;
    verifyPasswordReset: (token: string | null) => void;
    errorMessage: ErrorState;
}

const ResetPasswordHandlerComponent = ({urlToken, handleResetPassword, verifyPasswordReset, errorMessage}: PasswordResetHandlerProps) => {

    const [isValidPassword, setValidPassword] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordFeedback, setPasswordFeedback] = useState<ZxcvbnResult | null>(null);

    loadZxcvbnIfNotPresent();

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
            ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
            ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        )
    };

    useEffect(
        () => {verifyPasswordReset(urlToken)},
        []
    );

    return <Container id="email-verification">
        <div>
            <h3>Password change</h3>
            <Card>
                <CardBody>
                    <Form name="passwordReset">
                        <FormGroup>
                            <Label htmlFor="password-input">New password</Label>
                            <Input id="password" type="password" name="password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    passwordDebounce(e.target.value, setPasswordFeedback);
                                }}
                                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    passwordDebounce(e.target.value, setPasswordFeedback);
                                }}
                                required/>
                            {passwordFeedback &&
                            <span className='float-right small mt-1'>
                                <strong>Password strength: </strong>
                                <span id="password-strength-feedback">
                                    {passwordStrengthText[(passwordFeedback as ZxcvbnResult).score]}
                                </span>
                            </span>
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="password-confirm">Re-enter new password</Label>
                            <Input invalid={!isValidPassword} id="password-confirm" type="password" name="password" onBlur={(e: any) => {
                                validateAndSetPassword(e);
                                (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ? setCurrentPassword(e.target.value) : null}
                            } aria-describedby="invalidPassword" required/>
                            <FormFeedback id="invalidPassword">{(!isValidPassword) ? "Passwords must match and be at least 6 characters long" : null}</FormFeedback>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>
                    <h4 role="alert" className="text-danger text-center mb-0">
                        {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                    </h4>
                    <Button color="secondary" className="mb-2" block onClick={(e: any) => (isValidPassword && !errorMessage) ? handleResetPassword({token: urlToken, password: currentPassword}) : null}>Change Password</Button>
                </CardFooter>
            </Card>
        </div>
    </Container>;
};

export const ResetPasswordHandler = connect(stateToProps, dispatchToProps)(ResetPasswordHandlerComponent);
