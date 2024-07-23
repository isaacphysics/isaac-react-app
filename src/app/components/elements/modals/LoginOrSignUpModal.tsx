import React, {useEffect} from "react";
import {Button, Col, Form, Input, Label, Row} from "reactstrap";
import {closeActiveModal, selectors, store, useAppDispatch, useAppSelector} from "../../../state";
import {useLocation} from "react-router-dom";
import {
    EmailPasswordInputs,
    PasswordResetButton,
    TFAInput,
    useLoginLogic
} from "../../pages/LogIn";
import {isAda, KEY, persistence, siteSpecific} from "../../../services";
import classNames from "classnames";
import {RaspberryPiSignInButton} from "../RaspberryPiSignInButton";
import {GoogleSignInButton} from "../GoogleSignInButton";

const LoginOrSignUpBody = () => {

    const dispatch = useAppDispatch();
    const closeModal = () => dispatch(closeActiveModal());

    const user = useAppSelector(selectors.user.orNull);
    const location = useLocation();

    const {loginFunctions, setStateFunctions, loginValues} = useLoginLogic();
    const {attemptLogIn, signUp, validateAndLogIn} = loginFunctions;
    const {setEmail, setPassword, setRememberMe, setPasswordResetAttempted} = setStateFunctions;
    const {email, totpChallengePending, errorMessage, logInAttempted, passwordResetAttempted, rememberMe, isValidEmail, isValidPassword} = loginValues;

    // When modal is first shown, record the current question page to redirect back to after successful auth
    useEffect(() => {
        persistence.save(KEY.AFTER_AUTH_PATH, location.pathname + location.search + location.hash);
    }, []);

    if (user && user.loggedIn) {
        closeModal();
        return null;
    }

    return <Row id={"login-page"}>
        <Col lg={6} className={classNames("content-body", {"pattern-ada-dots": isAda})}>
            {siteSpecific(
                <img src={"/assets/phy/logo.svg"} alt={"Isaac Physics Logo"} />,
                <img src={"/assets/common/logos/ada_logo_3-stack_aqua.svg"} className={"mt-5 mb-4 pb-2 ms-3"} style={{width: "60%"}} alt={"Ada Computer Science Logo"} />
            )}
            <div className={"px-3 mb-4"}>
                <h1 className={"physics-strapline h2 mb-lg-3 mt-2"}>
                    Log in or sign up<br/>
                </h1>
                <p>You need to be logged in to your account to <b>save your answers and progress</b>. If you don&apos;t have an account, you can <b>sign up today for free</b>.</p>
                <br/>
                <p>Alternatively, you can</p>
                <Button size={"sm"} color={"primary"} style={{backgroundColor: siteSpecific("#ffffff66","#ffffff99")}} outline onClick={closeModal} block>
                    Continue without an account
                </Button>
            </div>
        </Col>
        <Col lg={6} id={"login-modal-form"}>
            {!totpChallengePending && <span className={"d-block d-lg-none pb-3"}>To <b>continue with an account</b>, please do so below</span>}
            <Form name="login" onSubmit={validateAndLogIn} noValidate>
                {totpChallengePending ?
                    <TFAInput rememberMe={rememberMe} />
                    :
                    <>
                        <EmailPasswordInputs
                            setEmail={setEmail} setPassword={setPassword}
                            validEmail={isValidEmail} logInAttempted={logInAttempted}
                            passwordResetAttempted={passwordResetAttempted} validPassword={isValidPassword}
                            errorMessage={errorMessage} displayLabels={false} />

                        <PasswordResetButton email={email} isValidEmail={isValidEmail} setPasswordResetAttempted={setPasswordResetAttempted} small />

                        <div>
                            <Input
                                id="login-remember-me"
                                className={"mb-2"}
                                type="checkbox"
                                onChange={e => setRememberMe(e.target.checked)}
                            />
                            <Label for="login-remember-me" className="ms-2">Remember me</Label>
                        </div>
                        
                        <div className="text-end">
                           <h4 role="alert" className="text-danger text-end mb-0">
                                {errorMessage}
                            </h4>
                        </div>

                        <Button
                            id="log-in"
                            tag="input" value="Log in"
                            color="secondary" type="submit" block
                            onClick={attemptLogIn}
                            disabled={!!user?.requesting}
                        />

                        <Button id="sign-up" color="primary" onClick={(e) => {
                            closeModal(); signUp(e);
                        }} outline block>
                            Sign up
                        </Button>

                        <hr className="text-center hr-or" />
                        {isAda && <RaspberryPiSignInButton concise={true} />}
                        <GoogleSignInButton/>
                    </>}
            </Form>
        </Col>
    </Row>;
};

export const loginOrSignUpModal = {
    centered: true,
    noPadding: true,
    closeAction: () => {store.dispatch(closeActiveModal());},
    body: LoginOrSignUpBody
};
