import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, Col, Form, FormGroup, FormFeedback, Input, Row, Label} from "reactstrap";
import {handleProviderLoginRedirect} from "../../state/actions";
import {logInUser, resetPassword} from "../../state/actions";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateToProps = (state: AppState) => ({errorMessage: state ? state.error : null});

const dispatchToProps = {
    handleProviderLoginRedirect,
    logInUser,
    resetPassword
};

interface LogInPageProps {
    handleProviderLoginRedirect: (provider: AuthenticationProvider) => void;
    logInUser: (provider: AuthenticationProvider, params: {email: string, password: string}) => void;
    resetPassword: (params: {email: string}) => void;
    errorMessage: string | null;
}

const LogInPageComponent = ({handleProviderLoginRedirect, logInUser, resetPassword, errorMessage}: LogInPageProps) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [logInAttempt, setLoginAttempt] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 5;
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    return <div id="login-page">

        <Card>
            <CardBody>
                <Form name="login" onSubmit={(e: any) => {e.preventDefault(); (isValidPassword && isValidEmail) ? logInUser("SEGUE", {email: email, password: password}) : null}} noValidate>
                    <Col size={4} className="">
                        <Row size={6}>
                            <Col>
                                <h2>Log in or sign up with:</h2>
                            </Col>
                        </Row>

                        <FormGroup>
                            <h3 className="login-error">{errorMessage}</h3>
                            <Label htmlFor="email-input">Email</Label>
                            <Input invalid={!isValidEmail && (logInAttempt || passwordResetRequest)} id="email-input" type="email" name="email" placeholder="Email address" onChange={(e: any) => setEmail(e.target.value)} required/>
                            <FormFeedback>{(!isValidEmail) ? "Enter a valid email address" : null}</FormFeedback>
                            <Label htmlFor="password-input">Password</Label>
                            <Input invalid={!isValidPassword && (logInAttempt)} id="password-input" type="password" name="password" placeholder="Password" onChange={(e: any) => setPassword(e.target.value)} required/>
                            <FormFeedback>{(!isValidPassword) ? "Enter a valid password" : null}</FormFeedback>
                        </FormGroup>
                        {!passwordResetRequest &&
                        <a tabIndex={0} className="password-reset" onClick={() => {
                            (isValidEmail) ? resetPassword({email: email}) : null;
                            (isValidEmail) ? setPasswordResetRequest(!passwordResetRequest) : null;
                        }}>Forgotten your password?</a>
                        }
                        {passwordResetRequest &&
                        <p><strong>Your password reset request is being processed. Please check your inbox.
                        </strong></p>
                        }
                        <FormGroup>
                            <Row>
                                <Col size={3} md={6}>
                                    <Button color="primary" type="submit" onClick={() => {setLoginAttempt(true)}} block>Log in</Button>
                                </Col>
                                <Col size={3} md={6}>
                                    <Button tag={Link} to="/register" color="primary" outline block>Sign up</Button>
                                </Col>
                            </Row>
                        </FormGroup>
                        <Row size={12} tm={5}>
                            <h3>Or:</h3>
                        </Row>
                        <Row size={12} tm={5}>
                            <a className="login-google" onClick={() => handleProviderLoginRedirect("GOOGLE")} tabIndex={0}/>
                        </Row>
                    </Col>
                </Form>
            </CardBody>
        </Card>
    </div>;
};

export const LogIn = connect(stateToProps, dispatchToProps)(LogInPageComponent);
