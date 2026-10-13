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
import { useTranslation } from "react-i18next";
import i18next from "i18next";

export const LogIn = () => {
    const { t } = useTranslation();

    const user = useAppSelector(selectors.user.orNull);

    const {loginFunctions, setStateFunctions, loginValues} = useLoginLogic();
    const {attemptLogIn, signUp, validateAndLogIn} = loginFunctions;
    const {setEmail, setPassword, setRememberMe, setPasswordResetAttempted} = setStateFunctions;
    const {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword} = loginValues;

    const headingRef = useRef<HTMLHeadingElement>(null);
    const subHeadingRef = useRef<HTMLHeadingElement>(null);

    useEffect( () => {
        document.title = i18next.t("common:auth.pageTitle", { siteName: SITE_TITLE });
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

    const metaDescription = t("site:auth.metaDescription");

    return <Container id="login-page" className="my-4 mb-7">
        <MetaDescription description={metaDescription} />
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card>
                    <CardBody>
                        <Form name="login" onSubmit={validateAndLogIn} noValidate>
                            <h1 className={classNames("h-title", {"h2 mb-4": isAda})} ref={headingRef} tabIndex={-1}>
                                {t("common:auth.login.heading")}
                            </h1>
                            {totpChallengePending ?
                                <TFAInput ref={subHeadingRef} rememberMe={rememberMe} />
                                :
                                <>
                                    <EmailPasswordInputs
                                        setEmail={setEmail} setPassword={setPassword}
                                        validEmail={isValidEmail} logInAttempted={logInAttempted}
                                        passwordResetAttempted={passwordResetAttempted} validPassword={isValidPassword}
                                        errorMessage={errorMessage} displayLabels={true} />
                                    <div role="alert" className="text-danger text-end mb-0 h4">
                                        {errorMessage}
                                    </div>
                                            
                                    <div className={classNames("mb-4 d-flex justify-content-between flex-wrap-reverse", {"mt-2": isAda})}>
                                        <div className='me-4 mt-1'>
                                            <StyledCheckbox
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={e => setRememberMe(e.target.checked)}
                                                label={<p>{t("common:auth.page.rememberMe")}</p>} className='mb-4'
                                            />
                                        </div>
                                        <PasswordResetButton email={email} isValidEmail={isValidEmail}
                                            setPasswordResetAttempted={setPasswordResetAttempted}/>
                                    </div>

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
                                                {t("common:auth.page.signUpButton")}
                                            </Button>
                                        </Col>
                                    </Row>

                                    {siteSpecific(<div className="section-divider"/>, <hr className="text-center mb-4"/>)}
                                    <div className={classNames("text-start mb-3", siteSpecific("h4", "h3"))}>{t("common:auth.page.ssoHeading")}</div>
                                    <div className="d-flex flex-column gap-2">
                                        {isAda && <RaspberryPiSignInButton/>}
                                        <GoogleSignInButton/>
                                        <MicrosoftSignInButton/>
                                        {isPhy && <SsoHelpLink />}
                                    </div>
                                </>
                            }
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
