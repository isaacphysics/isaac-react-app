import React from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, Col, Form, FormGroup, Input, Row, Label} from "reactstrap";
import {handleProviderLoginRedirect} from "../../state/actions";

const stateToProps = null;
const dispatchToProps = {loginProviderRedirect: handleProviderLoginRedirect};

interface LogInPageProps {
    loginProviderRedirect: (provider: string) => void
}
const LogInPageComponent = ({loginProviderRedirect}: LogInPageProps) => {
    const login = () => console.log("Log-in attempt"); // TODO: implement logging in
    const resetPassword = () => console.log("Reset password attempt"); // TODO: implement password reset

    return <div id="login-page">
        <h1 className="d-none d-md-block">
            Log in or Sign up to {" "} <Link to="/">Isaac</Link>.
        </h1>

        <Card>
            <CardBody>
                <Form name="login" onSubmit={login}>
                    <Row>
                        <Col size={12} md={5} className="text-sm-center">
                            <Row size={12}>
                                <Col>
                                    <h2>Log in or sign up with:</h2>
                                </Col>
                            </Row>
                            <Row size={12}>
                                <Col>
                                    <a className="login-google" onClick={() => loginProviderRedirect("google")} tabIndex={0}>
                                        Google {/* TODO: Update from google plus logo */}
                                    </a>
                                    <a className="login-twitter" onClick={() => loginProviderRedirect("twitter")} tabIndex={0}>
                                        Twitter
                                    </a>
                                    <a className="login-facebook" onClick={() => loginProviderRedirect("facebook")} tabIndex={0}>
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
                                <Input id="email-input" type="email" name="email" required />
                                <Label htmlFor="password-input">Password</Label>
                                <Input id="password-input" type="password" name="password" required />
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

export const LogInPage = connect(stateToProps, dispatchToProps)(LogInPageComponent);
