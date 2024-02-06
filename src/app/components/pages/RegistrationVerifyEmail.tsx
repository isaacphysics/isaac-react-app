import React, {useEffect} from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {
    errorSlice,
    getRTKQueryErrorMessage,
    selectors,
    showErrorToast,
    useAppDispatch,
    useAppSelector,
    useRequestEmailVerificationMutation,
    useVerifyEmailMutation
} from "../../state";
import {history, useQueryParams} from "../../services";
import {Link} from "react-router-dom";
import {ExigentAlert} from "../elements/ExigentAlert";


export const RegistrationVerifyEmail = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const {userid: userIdFromParams, token: tokenFromParams} = useQueryParams(true);

    const [sendVerificationEmail, {isUninitialized: verificationNotResent}] = useRequestEmailVerificationMutation();
    const [verifyEmail, {isSuccess: userFromParamVerificationSucceeded, isError: userFromParamVerificationFailed, error: userFromParamVerificationErrored}] = useVerifyEmailMutation();
    // Is the currently logged-in user the same user referenced in the query params?
    const verifyingCurrentUser = user && user.loggedIn && (user.id === Number(userIdFromParams) || userIdFromParams == undefined);
    const currentUserAlreadyVerified = user != null && user.loggedIn && (user.emailVerificationStatus === "VERIFIED");
    const emailVerified = (currentUserAlreadyVerified || userFromParamVerificationSucceeded);

    useEffect(() => {
        dispatch(errorSlice.actions.clearError());
        if (!emailVerified && userIdFromParams && tokenFromParams) {
            verifyEmail({userid: userIdFromParams, token: tokenFromParams});
        }
    }, [verifyEmail, userIdFromParams, tokenFromParams, emailVerified, errorSlice])

    const requestNewVerificationEmail = () => {
        if (user?.loggedIn) {
            if (!user?.email) {
                dispatch(showErrorToast(
                    "Email verification request failed.",
                    "You are not logged in or don't have an e-mail address to verify."
                ));
            } else {
                sendVerificationEmail({email: user?.email});
            }
        }
    };

    const myAccount = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/account");
    };

    const continueToPreferences = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register/preferences");
    };

    return <Container className="text-center">
        <Card className="my-5">
            <CardBody>
                {!emailVerified && userFromParamVerificationFailed &&
                    <ExigentAlert color="warning">
                        <p className="alert-heading font-weight-bold">Unable to verify your email address</p>
                        <p>{getRTKQueryErrorMessage(userFromParamVerificationErrored).message}</p>
                    </ExigentAlert>
                }
                <Row className="justify-content-center">
                    <Col>
                        <h3>Verify your account</h3>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        {emailVerified ?
                            userFromParamVerificationSucceeded ?
                                <p>Account verified and created!</p>
                                :
                                <p>Your email is already verified.</p>
                            :
                            <p>Check your email for a link to verify your account.</p>
                        }
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        {emailVerified ?
                            <img className="img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_done.svg"} alt="" />
                            :
                            <img className="img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_request.svg"} alt="" />
                        }
                    </Col>
                </Row>
                {!emailVerified &&
                    <Row className="justify-content-center">
                        {verifyingCurrentUser ?
                            <p>
                                {verificationNotResent ?
                                    <Button onClick={requestNewVerificationEmail}>
                                        Resend verification email
                                    </Button>
                                    :
                                    "Verification email sent to " + (user && user.loggedIn && user.email)
                                }
                            </p>
                            :
                            <p>If you need a new verification email, please <Link to="/login">log in</Link> first.</p>
                        }
                    </Row>
                }
                {verifyingCurrentUser ?
                    emailVerified &&
                        <Row className="justify-content-center">
                            <Col xs={12} sm={6} lg={3}>
                                <Button className={"my-2"} outline color="secondary" onClick={myAccount}>Your account</Button>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <Button className={"my-2"} onClick={continueToPreferences}>Continue</Button>
                            </Col>
                        </Row>
                    :
                    emailVerified &&
                        <Row className="justify-content-center">
                            <Col xs={3}>
                                <p>Please <Link to="/login">log in</Link> to continue.</p>
                            </Col>
                        </Row>
                }
            </CardBody>
        </Card>
    </Container>
}