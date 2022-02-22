import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import {handleProviderLoginRedirect, resetPassword} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {history} from "../../services/history";
import {Redirect} from "react-router";
import {selectors} from "../../state/selectors";
import {SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import * as RS from "reactstrap";
import {useLoginMutation, useTotpChallengeMutation} from "../../state/slices/api";

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
    const errorMessage = useSelector(selectors.error.general);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [logInAttempted, setLoginAttempted] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 0;

    const [passwordResetAttempted, setPasswordResetAttempted] = useState(false);
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    const [mfaVerificationCode, setMfaVerificationCode] = useState("");

    const [ loginTrigger, { data: user } ] = useLoginMutation();
    const [ totpChallengeTrigger ] = useTotpChallengeMutation();

    const validateAndLogIn = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if ((isValidPassword && isValidEmail)) {
            loginTrigger({provider: "SEGUE", credentials: {email: email, password: password, rememberMe: rememberMe}});
        }
    }, [email, password, rememberMe, isValidEmail, isValidPassword, loginTrigger]);

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
                                                if (mfaVerificationCode) totpChallengeTrigger({mfaVerificationCode, rememberMe})
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

                                    <Row className="mb-4">
                                        <Col className={"col-5 mt-1"}>
                                            <RS.CustomInput
                                                id="login-remember-me"
                                                type="checkbox"
                                                label="Remember me"
                                                onChange={e => setRememberMe(e.target.checked)}
                                            />
                                        </Col>
                                        <Col className="text-right">
                                            <div>
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
                                            </div>
                                        </Col>
                                    </Row>

                                    <Row className="mb-4">
                                        <Col sm={6}>
                                            <Button
                                                id="log-in"
                                                tag="input" value="Log in"
                                                color="secondary" type="submit" className="mb-2" block
                                                onClick={attemptLogIn}
                                                disabled={!!user?.requesting}
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
                                </React.Fragment>
                            }
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
