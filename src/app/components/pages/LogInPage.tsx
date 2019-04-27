import React from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, Input, Form, FormGroup, Label} from "reactstrap";
import {handleProviderLoginRedirect} from "../../state/actions";

const stateToProps = null;
const dispatchToProps = {loginProviderRedirect: handleProviderLoginRedirect};

interface LogInPageProps {
    loginProviderRedirect: (provider: string) => any
}
const LogInPageComponent = ({loginProviderRedirect}: LogInPageProps) => {
    const login = () => console.log("Log-in attempt"); // TODO: implement logging in
    const resetPassword = () => console.log("Reset password attempt"); // TODO: implement password reset

    return <div id="login-panel">
        <h1 className="d-none d-md-block login-header">
            Log in or Sign up to {" "} <Link to="/">Isaac</Link>.
        </h1>

        <Card>
        <CardBody>
        <Form name="login" onSubmit={login}>

            <div className="row">
                <div className='col-12 col-md-5 text-sm-center'>
                    <div>
                       <h2>Log in or sign up with:</h2>
                    </div>
                    <div>
                        <a tabIndex={0} className="login-social-google" onClick={() => loginProviderRedirect("google")}>
                            Google {/* TODO: Update from google plus logo */}
                        </a>
                        <a tabIndex={0} className="login-social-twitter" onClick={() => loginProviderRedirect("twitter")}>
                            Twitter
                        </a>
                        <a tabIndex={0} className="login-social-facebook" onClick={() => loginProviderRedirect("facebook")}>
                            Facebook
                        </a>
                    </div>
                </div>

                <div className="col-12 col-md-2 text-center">
                    <h2 className="login-separator"><span>or</span></h2>
                </div>

                <div className="col-12 col-md-5">
                    {/* TODO: Password request is being processed   */}
                    {/* TODO: Error Message */}
                    {/* TODO: Input Validation */}
                    <FormGroup>
                        <div className="row">
                            <Label htmlFor="email-input">Email</Label>
                            <Input id="email-input" type="email" name="email" required />
                        </div>
                        <div className="row">
                            <Label htmlFor="password-input">Password</Label>
                            <Input id="password-input" type="password" name="password" required />
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <Button color="primary" type="submit" block>
                                    Log in
                                </Button>
                            </div>
                            <div className="col-12 col-md-6">
                                <Button tag={Link} to="/register" color="primary" outline block>
                                    Sign up
                                </Button>
                            </div>
                        </div>
                        <a tabIndex={0} onClick={resetPassword}>Forgotten your password?</a>
                    </FormGroup>
                </div>
            </div>

        </Form>
        </CardBody>
        </Card>
    </div>;
};

export const LogInPage = connect(stateToProps, dispatchToProps)(LogInPageComponent);
