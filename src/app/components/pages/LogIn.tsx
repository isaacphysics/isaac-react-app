import classNames from "classnames";
import React, { useRef, useEffect } from "react";
import { Navigate, Form } from "react-router";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { SITE_TITLE, siteSpecific, isAda, isPhy } from "../../services";
import { useAppSelector, selectors } from "../../state";
import { GoogleSignInButton } from "../elements/GoogleSignInButton";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { MetaDescription } from "../elements/MetaDescription";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { RaspberryPiSignInButton } from "../elements/RaspberryPiSignInButton";
import { Loading } from "../handlers/IsaacSpinner";
import { TFAInput, EmailPasswordInputs, PasswordResetButton, SsoHelpLink } from "../elements/LogInInputs";
import { useLoginLogic } from "../../services/login";

export const LogIn = () => {

    const user = useAppSelector(selectors.user.orNull);

    const {loginFunctions, setStateFunctions, loginValues} = useLoginLogic();
    const {attemptLogIn, signUp, validateAndLogIn} = loginFunctions;
    const {setEmail, setPassword, setRememberMe, setPasswordResetAttempted} = setStateFunctions;
    const {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword} = loginValues;

    const headingRef = useRef<HTMLHeadingElement>(null);
    const subHeadingRef = useRef<HTMLHeadingElement>(null);

    useEffect( () => {
        document.title = "Login – " + SITE_TITLE;
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
        return logInAttempted ? <Loading/> : <Navigate to="/"/>;
    }

    const metaDescription = siteSpecific(
        "Log in to Isaac to learn and track your progress.",
        "Log in to your Ada Computer Science account to access hundreds of computer science topics and questions.");

    return <Container id="login-page" className="my-4 mb-7">
        <MetaDescription description={metaDescription} />
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card>
                    <CardBody>
                        <Form name="login" onSubmit={validateAndLogIn} noValidate>
                            <h2 className={classNames("h-title", {"mb-4": isAda})}  ref={headingRef} tabIndex={-1}>
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

                                    <Row className={classNames("mb-4", {"mt-2": isAda})}>
                                        <Col className={"col-5 mt-1 d-flex"}>
                                            <StyledCheckbox
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={e => setRememberMe(e.target.checked)}
                                                label={<p>Remember me</p>} className='mb-4'
                                            />
                                        </Col>
                                        <Col className="align-content-center">
                                            <h4 role="alert" className="text-danger text-end mb-0">
                                                {errorMessage}
                                            </h4>
                                            <PasswordResetButton email={email} isValidEmail={isValidEmail}
                                                setPasswordResetAttempted={setPasswordResetAttempted}/>
                                        </Col>
                                    </Row>

                                    <Row className="mb-4">
                                        <Col sm={6}>
                                            <Button
                                                id="log-in"
                                                tag="input" value="Log in"
                                                color="solid"
                                                type="submit" className="mb-2" block
                                                onClick={attemptLogIn}
                                                disabled={!!user?.requesting}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Button id="sign-up" color="keyline" className="mb-2" onClick={signUp} block>
                                                Sign up
                                            </Button>
                                        </Col>
                                    </Row>

                                    {siteSpecific(<div className="section-divider"/>, <hr className="text-center mb-4"/>)}
                                    <div className={classNames("text-start mb-3", siteSpecific("h4", "h3"))}>Log in with:</div>
                                    {isAda &&
                                        <Row className="mb-2 justify-content-center">
                                            <Col sm={9}>
                                                <RaspberryPiSignInButton/>
                                            </Col>
                                        </Row>}
                                    <Row className="mb-2 justify-content-center" >
                                        <Col sm={9}>
                                            <GoogleSignInButton/>
                                        </Col>
                                    </Row>
                                    <Row className={classNames("justify-content-center", siteSpecific("mb-2", "mb-3"))}>
                                        <Col sm={9}>
                                            <MicrosoftSignInButton/>
                                        </Col>
                                    </Row>
                                    {isPhy && <Row className="mb-2">
                                        <Col>
                                            <SsoHelpLink />
                                        </Col>
                                    </Row>}
                                </React.Fragment>
                            }
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
