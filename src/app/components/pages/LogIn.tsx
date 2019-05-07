import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, Col, Form, FormGroup, Input, Row, Label} from "reactstrap";
import {handleProviderLoginRedirect} from "../../state/actions";
import {logInUser} from "../../state/actions";
import {AuthenticationProvider} from "../../../IsaacApiTypes";

const stateToProps = null;
const dispatchToProps = {
    handleProviderLoginRedirect,
    logInUser
};

interface LogInPageProps {
    handleProviderLoginRedirect: (provider: AuthenticationProvider) => void;
    logInUser: (provider: AuthenticationProvider, params: {email: string, password: string}) => void;
}

const LogInPageComponent = ({handleProviderLoginRedirect, logInUser}: LogInPageProps) => {
    const resetPassword = () => console.log("Reset password attempt"); // TODO: implement password reset



    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return <div id="login-page">
        <h1 className="d-none d-md-block">
            Log in or Sign up to {" "} <Link to="/">Isaac</Link>.
        </h1>

        <Card>
            <CardBody>
                <Form name="login" onSubmit={(e: any) => {e.preventDefault(); logInUser("SEGUE", {email: email, password: password})}}>
                    <Row>
                        <Col size={12} md={5} className="text-sm-center">
                            <Row size={12}>
                                <Col>
                                    <h2>Log in or sign up with:</h2>
                                </Col>
                            </Row>
                            <Row size={12}>
                                <Col>
                                    <a className="login-google" onClick={() => handleProviderLoginRedirect("GOOGLE")} tabIndex={0}>
                                        Google {/* TODO: Update from google plus logo */}
                                    </a>
                                    <a className="login-twitter" onClick={() => handleProviderLoginRedirect("TWITTER")} tabIndex={0}>
                                        Twitter
                                    </a>
                                    <a className="login-facebook" onClick={() => handleProviderLoginRedirect("FACEBOOK")} tabIndex={0}>
                                        Facebook
                                    </a>
                                </Col>
                            </Row>
                        </Col>

                        <Col size={12} md={2} className="text-center">
                            <h2 className="login-separator"><span>or</span></h2>
                        </Col>

                        <Col size={12} md={5}>
                            {/* TODO: Password request is being processed   */}
                            {/* TODO: Error Message */}
                            {/* TODO: Input Validation */}

                            <FormGroup>
                                <Label htmlFor="email-input">Email</Label>
                                <Input id="email-input" type="email" name="email" onChange={(e: any) => setEmail(e.target.value)} required />
                                <Label htmlFor="password-input">Password</Label>
                                <Input id="password-input" type="password" name="password" onChange={(e: any) => setPassword(e.target.value)} required />
                            </FormGroup>

                            <FormGroup>
                                <Row>
                                    <Col size={12} md={6}>
                                        <Button color="primary" type="submit" block>Log in</Button>
                                    </Col>
                                    <Col size={12} md={6}>
                                        <Button tag={Link} to="/register" color="primary" outline block>Sign up</Button>
                                    </Col>
                                </Row>
                                <a tabIndex={0} onClick={resetPassword}>Forgotten your password?</a>
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </div>;
};

export const LogIn = connect(stateToProps, dispatchToProps)(LogInPageComponent);
