import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {handleProviderLoginRedirect, logInUser, resetPassword} from "../../state/actions";
import {history} from "../../services/history";
import {Redirect} from "react-router";
import {SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {error, userOrNull} from "../../state/selectors";

export const LogIn = () => {
    useEffect( () => {document.title = "Login — Isaac " + SITE_SUBJECT_TITLE;}, []);

    const dispatch = useDispatch();
    const user = useSelector(userOrNull);
    const errorMessage = useSelector(error.general);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [logInAttempted, setLoginAttempted] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 0;

    const [passwordResetAttempted, setPasswordResetAttempted] = useState(false);
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    const validateAndLogIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if ((isValidPassword && isValidEmail)) {
            dispatch(logInUser("SEGUE", {email: email, password: password}));
        }
    };

    const signUp = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        history.push("/register", {email: email, password: password});
    };

    const attemptPasswordReset = () => {
        setPasswordResetAttempted(true);
        if (isValidEmail) {
            dispatch(resetPassword({email: email}));
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    const logInWithGoogle = () => {
        dispatch(handleProviderLoginRedirect("GOOGLE"));
    };

    const attemptLogIn = () => {
        setLoginAttempted(true);
    };

    if (user && user.loggedIn) {
        return <Redirect to="/" />;
    }

    return <Container id="login-page" className="my-4">
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card>
                    <CardBody>
                        <Form name="login" onSubmit={validateAndLogIn} noValidate>

                            <h2 className="h-title mb-4">Log&nbsp;in or sign&nbsp;up:</h2>

                            <FormGroup>
                                <Label htmlFor="email-input">Email address</Label>
                                <Input
                                    id="email-input" type="email" name="email" placeholder="Email address"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                                    invalid={!!errorMessage || (!isValidEmail && (logInAttempted || passwordResetAttempted))}
                                    aria-describedby="emailValidationMessage"
                                    required
                                />
                                <FormFeedback id="emailValidationMessage">
                                    {!isValidEmail && "Please enter a valid email address"}
                                </FormFeedback>
                            </FormGroup>

                            <FormGroup className="mb-0">
                                <Label htmlFor="password-input">Password</Label>
                                <Input
                                    id="password-input" type="password" name="password" placeholder="Password"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                                    invalid={!!errorMessage || (!isValidPassword && (logInAttempted))}
                                    aria-describedby="passwordValidationMessage"
                                    required
                                />
                                <FormFeedback id="passwordValidationMessage">
                                    {!isValidPassword && "Passwords must be at least six characters long"}
                                </FormFeedback>
                            </FormGroup>

                            <Row className="mb-4 text-right">
                                <Col>
                                    <h4 role="alert" className="text-danger text-right mb-0">
                                        {errorMessage}
                                    </h4>
                                    {!passwordResetRequest ?
                                        <Button color="link" onClick={attemptPasswordReset}>
                                            Forgotten your password?
                                        </Button> :
                                        <p>
                                            <strong className="d-block">Your password reset request is being processed.</strong>
                                            <strong className="d-block">Please check your inbox.</strong>
                                        </p>
                                    }
                                </Col>
                            </Row>

                            <Row className="mb-4">
                                <Col sm={6}>
                                    <Button
                                        id="log-in"
                                        tag="input" value="Log in"
                                        color="secondary" type="submit" className="mb-2" block
                                        onClick={attemptLogIn}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <Button id="sign-up" color="primary" className="mb-2" onClick={(e: any) => signUp(e)} outline block>
                                        Sign up
                                    </Button>
                                </Col>
                            </Row>

                            <hr className="text-center" />

                            <Row className="my-4">
                                <Col className="text-center">
                                    <Button block className="login-google" color="link" onClick={logInWithGoogle}>
                                        Log in with Google
                                    </Button>
                                </Col>
                            </Row>

                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
