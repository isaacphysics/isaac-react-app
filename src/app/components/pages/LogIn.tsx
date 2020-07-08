import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {handleProviderLoginRedirect, logInUser, resetPassword, submitTotpChallengeResponse} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {history} from "../../services/history";
import {Redirect} from "react-router";
import {selectors} from "../../state/selectors";
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";

export const LogIn = () => {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const subHeadingRef = useRef<HTMLHeadingElement>(null);

    const totpChallengePending = useSelector((state: AppState) => {
        return state?.totpChallengePending;
    });

    useEffect( () => {
        document.title = "Login — Isaac " + SITE_SUBJECT_TITLE;
        if (!(window as any).followedAtLeastOneSoftLink) {
            return;
        }
        const mainHeading = headingRef.current;
        const subHeading = subHeadingRef.current;
        if (totpChallengePending && subHeading) {
            subHeading.focus();
        } else if (mainHeading) {
            mainHeading.focus();
        }
    }, [totpChallengePending]);

    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const errorMessage = useSelector(selectors.error.general);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [logInAttempted, setLoginAttempted] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 0;

    const [passwordResetAttempted, setPasswordResetAttempted] = useState(false);
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    const [mfaVerificationCode, setMfaVerificationCode] = useState("");

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

                            <h2 className="h-title mb-4"  ref={headingRef} tabIndex={-1}>
                                Log&nbsp;in or sign&nbsp;up:
                            </h2>
                            {totpChallengePending ?
                                <React.Fragment>
                                    <h3 ref={subHeadingRef} tabIndex={-1}>Two-Factor Authentication</h3>
                                    <p>Two-factor authentication has been enabled for this account.</p>
                                    <FormGroup>
                                        <Label htmlFor="verification-code">Verification Code</Label>
                                        <Input
                                            id="verification-code" type="text" name="verification-code" placeholder="Verification code"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setMfaVerificationCode(e.target.value)
                                            }
                                            invalid={isNaN(Number(mfaVerificationCode))}
                                            required
                                        />
                                        <FormFeedback id="verification-code-validation-message">
                                            {isNaN(Number(mfaVerificationCode)) && "Please enter a valid verification code"}
                                        </FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Button
                                            id="submit-verification-code"
                                            tag="input" value="Verify"
                                            color="secondary" type="submit" className="mb-2" block
                                            disabled={isNaN(Number(mfaVerificationCode))}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                if (mfaVerificationCode)
                                                    dispatch(submitTotpChallengeResponse(mfaVerificationCode))
                                            }}
                                        />
                                    </FormGroup>
                                </React.Fragment>
                                :
                                <React.Fragment>
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
                                                    <strong id="password-reset-processing" className="d-block">
                                                        Your password reset request is being processed.
                                                    </strong>
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
                                            {/* TODO:ENABLE_GOOGLE */}
                                            <Button block className="login-google" disabled={SITE_SUBJECT === SITE.PHY} color="link" onClick={logInWithGoogle}>
                                                Log in with Google
                                            </Button>
                                            {SITE_SUBJECT === SITE.PHY && <p className="mt-3 mb-0">
                                                Google authentication is <strong>temporarily disabled</strong><br />for the beta version of the site.
                                            </p>}
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            }
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
