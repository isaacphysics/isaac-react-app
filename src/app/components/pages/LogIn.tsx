import React, {useEffect, useRef, useState} from 'react';
import {
    AppState,
    handleProviderLoginRedirect,
    logInUser,
    resetPassword,
    selectors,
    submitTotpChallengeResponse,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    CustomInput,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {history, isAda, SITE_TITLE, siteSpecific} from "../../services";
import {Redirect} from "react-router";
import {MetaDescription} from "../elements/MetaDescription";
import {Loading} from "../handlers/IsaacSpinner";

/* Interconnected state and functions providing a "logging in" API - intended to be used within a component that displays
 * email and password inputs, and a button to login, all inside a Form component. You will also need a TFAInput component,
 * to handle when users have two-factor auth enabled.
 * For examples, see usage in LogIn or LoginOrSignUpBody components.
 */
export const useLoginLogic = () => {

    const dispatch = useAppDispatch();

    const totpChallengePending = useAppSelector((state: AppState) => state?.totpChallengePending);
    const errorMessage = useAppSelector(selectors.error.general);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [logInAttempted, setLoginAttempted] = useState(false);

    const isValidEmail = email.length > 0 && email.includes("@");
    const isValidPassword = password.length > 0;

    const [passwordResetAttempted, setPasswordResetAttempted] = useState(false);

    const validateAndLogIn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if ((isValidPassword && isValidEmail)) {
            dispatch(logInUser("SEGUE", {email: email, password: password, rememberMe: rememberMe}));
        }
    };

    const signUp = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register", {email: email, password: password});
    };

    const attemptLogIn = () => {
        setLoginAttempted(true);
    };

    return {
        loginFunctions: {attemptLogIn, signUp, validateAndLogIn},
        setStateFunctions: {setEmail, setPassword, setRememberMe, setPasswordResetAttempted},
        loginValues: {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword}
    };
}

// Button prompting the user to sign in via Google
export const GoogleSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithGoogle = () => {
        dispatch(handleProviderLoginRedirect("GOOGLE"));
    };

    return <Button className={"position-relative"} block outline color="primary" onClick={logInWithGoogle}>
        <img className="google-button-logo" src={"/assets/google-logo.svg"} alt={"Google logo"}/>Google
    </Button>
}

// Button prompting the user to sign in via Raspberry Pi Accounts
export const RaspberryPiSignInButton = () => {
    const dispatch = useAppDispatch();

    const logInWithRaspberryPi = () => {
        dispatch(handleProviderLoginRedirect("RASPBERRYPI"));
    };

    return <Button className={"position-relative"} block outline color="primary" onClick={logInWithRaspberryPi}>
        <img className="rpf-button-logo" src={"/assets/logos/raspberry-pi.png"} alt={"Raspberry Pi logo"}/>Raspberry Pi Foundation
    </Button>
}

// Handles display and logic of the two-factor authentication form (usually shown after the first login step)
export const TFAInput = React.forwardRef(function TFAForm({rememberMe}: {rememberMe: boolean}, ref: React.Ref<HTMLHeadingElement>) {
    const dispatch = useAppDispatch();
    const [mfaVerificationCode, setMfaVerificationCode] = useState("");

    return <>
        <h3 ref={ref} tabIndex={-1}>Two-Factor Authentication</h3>
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
                        dispatch(submitTotpChallengeResponse(mfaVerificationCode, rememberMe))
                }}
            />
        </FormGroup>
    </>;
});

// Component handling the display of "Forgotten your password?" and its relevant interactions
export const PasswordResetButton = ({email, isValidEmail, setPasswordResetAttempted, small}: {email: string, isValidEmail: boolean, setPasswordResetAttempted: (b: boolean) => void, small?: boolean}) => {
    const dispatch = useAppDispatch();
    const [passwordResetRequest, setPasswordResetRequest] = useState(false);

    const attemptPasswordReset = () => {
        setPasswordResetAttempted(true);
        if (isValidEmail) {
            dispatch(resetPassword({email: email}));
            setPasswordResetRequest(!passwordResetRequest);
        }
    };

    return !passwordResetRequest ?
        <div className={small ? "mt-1 w-100 text-right" : ""}>
            <Button color="link" onClick={attemptPasswordReset}>
                {small ? <small>Forgotten your password?</small> : "Forgotten your password?"}
            </Button>
        </div>
        :
        <p className={"mt-1"}>
            <strong id="password-reset-processing" className="d-block">
                Your password reset request is being processed.{small && " Please check your inbox."}
            </strong>
            {!small && <strong>
                Please check your inbox.
            </strong>}
        </p>;
}

interface EmailPasswordInputsProps {
    setEmail: (email: string) => void;
    setPassword: (pass: string) => void;
    validEmail: boolean;
    validPassword: boolean;
    logInAttempted: boolean;
    passwordResetAttempted: boolean;
    errorMessage: string | null;
    displayLabels?: boolean;
}
export const EmailPasswordInputs =({setEmail, setPassword, validEmail, validPassword, logInAttempted, passwordResetAttempted, errorMessage, displayLabels = true}: EmailPasswordInputsProps) => {
    return <>
        <FormGroup>
            {displayLabels && <Label htmlFor="email-input">Email address</Label>}
            <Input
                id="email-input" type="email" name="email" placeholder="Email address"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                invalid={!!errorMessage || (!validEmail && (logInAttempted || passwordResetAttempted))}
                aria-describedby="emailValidationMessage"
                required
            />
            <FormFeedback id="emailValidationMessage">
                {!validEmail && "Please enter a valid email address"}
            </FormFeedback>
        </FormGroup>

        <FormGroup className="mb-0">
            {displayLabels && <Label htmlFor="password-input">Password</Label>}
            <Input
                id="password-input" type="password" name="password" placeholder="Password"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                invalid={!!errorMessage || (!validPassword && (logInAttempted))}
                aria-describedby="passwordValidationMessage"
                required
            />
            <FormFeedback id="passwordValidationMessage">
                {!validPassword && "Passwords must be at least six characters long"}
            </FormFeedback>
        </FormGroup>
    </>;
}

// Main login page component, utilises all of the components defined above
export const LogIn = () => {

    const user = useAppSelector(selectors.user.orNull);

    const {loginFunctions, setStateFunctions, loginValues} = useLoginLogic();
    const {attemptLogIn, signUp, validateAndLogIn} = loginFunctions;
    const {setEmail, setPassword, setRememberMe, setPasswordResetAttempted} = setStateFunctions;
    const {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword} = loginValues;

    const headingRef = useRef<HTMLHeadingElement>(null);
    const subHeadingRef = useRef<HTMLHeadingElement>(null);

    useEffect( () => {
        document.title = "Login — " + SITE_TITLE;
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

    if (user && user.loggedIn) {
        return logInAttempted ? <Loading/> : <Redirect to="/"/>;
    }

    const metaDescriptionCS = "Log in to your Ada Computer Science account to access hundreds of computer science topics and questions.";

    return <Container id="login-page" className="my-4 mb-5">
        {isAda && <MetaDescription description={metaDescriptionCS} />}
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card>
                    <CardBody>
                        <Form name="login" onSubmit={validateAndLogIn} noValidate>

                            <h2 className="h-title mb-4"  ref={headingRef} tabIndex={-1}>
                                Log&nbsp;in or sign&nbsp;up:
                            </h2>
                            {totpChallengePending ?
                                <TFAInput ref={subHeadingRef} rememberMe={rememberMe} />
                                :
                                <React.Fragment>
                                    <EmailPasswordInputs
                                        setEmail={setEmail} setPassword={setPassword}
                                        validEmail={isValidEmail} logInAttempted={logInAttempted}
                                        passwordResetAttempted={passwordResetAttempted} validPassword={isValidPassword}
                                        errorMessage={errorMessage} displayLabels={true} />

                                    <Row className="mb-4">
                                        <Col className={"col-5 mt-1"}>
                                            <CustomInput
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
                                                <PasswordResetButton email={email} isValidEmail={isValidEmail}
                                                                     setPasswordResetAttempted={setPasswordResetAttempted}/>
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
                                            <Button id="sign-up" color="primary" className="mb-2" onClick={signUp}
                                                    outline block>
                                                Sign up
                                            </Button>
                                        </Col>
                                    </Row>

                                    <hr className="text-center mb-4"/>
                                    <h3 className="text-center">Log in with:</h3>
                                    {
                                        isAda &&
                                            <Row className="mb-2 justify-content-center">
                                                <Col sm={9}>
                                                    <RaspberryPiSignInButton/>
                                                </Col>
                                            </Row>
                                    }
                                    <Row className="mb-3 justify-content-center">
                                        <Col sm={9}>
                                            <GoogleSignInButton/>
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
