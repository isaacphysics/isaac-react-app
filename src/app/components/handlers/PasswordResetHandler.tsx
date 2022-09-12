import React, {useEffect, useState} from 'react';
import {AppState, handlePasswordReset, useAppDispatch, useAppSelector, verifyPasswordReset} from "../../state";
import {Button, Card, CardBody, CardFooter, Container, Form, FormFeedback, FormGroup, Input, Label} from "reactstrap";
import {PasswordFeedback} from "../../../IsaacAppTypes";
import {loadZxcvbnIfNotPresent, passwordDebounce} from "../../services";
import {RouteComponentProps} from "react-router";


export const ResetPasswordHandler = ({match}: RouteComponentProps<{token?: string}>) => {
    const dispatch = useAppDispatch();
    const errorMessage = useAppSelector((state: AppState) => state?.error || null);
    const urlToken = match.params.token || null;

    const [isValidPassword, setValidPassword] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);

    loadZxcvbnIfNotPresent();

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
            ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
            ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        )
    };

    useEffect(() => {dispatch(verifyPasswordReset(urlToken))}, [dispatch, urlToken]);

    return <Container id="email-verification">
        <div>
            <h3>Password change</h3>
            <Card>
                <CardBody>
                    <Form name="passwordReset">
                        <FormGroup>
                            <Label htmlFor="password">New password</Label>
                            <Input id="password" type="password" name="password-new"
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
                                    {passwordFeedback.feedbackText}
                                </span>
                            </span>
                            }
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="password-confirm">Re-enter new password</Label>
                            <Input invalid={!isValidPassword} id="password-confirm" type="password" name="password-new-confirm" onBlur={e => {
                                validateAndSetPassword(e);
                                if (e.target.value == (document.getElementById("password") as HTMLInputElement).value) {
                                    setCurrentPassword(e.target.value)
                                }
                            }} aria-describedby="invalidPassword" required/>
                            <FormFeedback id="invalidPassword">{(!isValidPassword) ? "Passwords must match and be at least 6 characters long" : null}</FormFeedback>
                        </FormGroup>
                    </Form>
                </CardBody>
                <CardFooter>
                    <h4 role="alert" className="text-danger text-center mb-0">
                        {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                    </h4>
                    <Button color="secondary" className="mb-2" block
                        onClick={() => {
                            if (isValidPassword && !errorMessage && urlToken) {
                                dispatch(handlePasswordReset({token: urlToken, password: currentPassword}));
                            }
                        }}
                        id="change-password"
                    >
                        Change Password
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </Container>;
};
