import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {verifyPasswordReset, handlePasswordReset} from "../../state/actions";
import {Button, Col, FormFeedback, Input, Label, Row, Card, CardBody, Form, FormGroup, CardFooter} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";

const stateToProps = (state: AppState) => ({
    errorMessage: state ? state.error : null
});

const dispatchToProps = {
    handleResetPassword: handlePasswordReset,
    verifyPasswordReset: verifyPasswordReset
};

interface PasswordResetHandlerProps {
    handleResetPassword: (params: {token: string | null; password: string | null}) => void;
    verifyPasswordReset: (token: string | null) => void;
    errorMessage: ErrorState;
}

const ResetPasswordHandlerComponent = ({handleResetPassword, verifyPasswordReset, errorMessage}: PasswordResetHandlerProps) => {
    const resetToken = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

    const [isValidPassword, setValidPassword] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
            ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
            ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        )
    };

    useEffect(() => {
        setTimeout(function(){verifyPasswordReset(resetToken)},10);
    }, []);

    return <div id="email-verification">
        <div>
            <h3>Password Change</h3>
            <Card>
                <CardBody>
                    <Form name="passwordReset">
                        <Row>
                            <FormGroup>
                                <Label htmlFor="password-input">New Password</Label>
                                <Input id="password" type="password" name="password" required/>
                            </FormGroup>
                        </Row>
                        <Row>
                            <FormGroup>
                                <Label htmlFor="password-confirm">Re-enter New Password</Label>
                                <Input invalid={!isValidPassword} id="password-confirm" type="password" name="password" onBlur={(e: any) => {
                                    validateAndSetPassword(e);
                                    (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ? setCurrentPassword(e.target.value) : null}
                                } aria-describedby="invalidPassword" required/>
                                <FormFeedback id="invalidPassword">{(!isValidPassword) ? "Passwords must match and be at least 6 characters long" : null}</FormFeedback>
                            </FormGroup>
                        </Row>
                    </Form>
                </CardBody>
                <CardFooter>
                    <h4 role="alert" className="text-danger text-center mb-0">
                        {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                    </h4>
                    <Button color="secondary" className="mb-2" block onClick={(e: any) => (isValidPassword && !errorMessage) ? handleResetPassword({token: resetToken, password: currentPassword}) : null}>Change Password</Button>
                </CardFooter>
            </Card>
        </div>
    </div>;
};

export const ResetPasswordHandler = connect(stateToProps, dispatchToProps)(ResetPasswordHandlerComponent);
