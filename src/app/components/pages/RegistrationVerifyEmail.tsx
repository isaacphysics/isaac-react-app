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
import {useQueryParams} from "../../services";
import {Link, useNavigate} from "react-router-dom";
import {ExigentAlert} from "../elements/ExigentAlert";
import {useCheckCurrentUserOnActivity} from "../../services/useCheckCurrentUserOnActivity";


export const RegistrationVerifyEmail = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const navigate = useNavigate();
    const {userid: userIdFromParams, token: tokenFromParams} = useQueryParams(true);

    const [sendVerificationEmail, {isUninitialized: verificationNotResent}] = useRequestEmailVerificationMutation();
    const [verifyEmail, {isSuccess: userFromParamVerificationSucceeded, isError: userFromParamVerificationFailed, error: userFromParamVerificationErrored}] = useVerifyEmailMutation();
    // Is the currently logged-in user the same user referenced in the query params?
    const verifyingCurrentUser = user && user.loggedIn && (user.id === Number(userIdFromParams) || userIdFromParams == undefined);
    const currentUserAlreadyVerified = user != null && user.loggedIn && (user.emailVerificationStatus === "VERIFIED");
    const emailVerified = (currentUserAlreadyVerified || userFromParamVerificationSucceeded);

    useCheckCurrentUserOnActivity(!!user && user.loggedIn && !user.teacherAccountPending);

    useEffect(() => {
        dispatch(errorSlice.actions.clearError());
        if (!emailVerified && userIdFromParams && tokenFromParams) {
            void verifyEmail({userid: userIdFromParams, token: tokenFromParams});
        }
    }, [verifyEmail, userIdFromParams, tokenFromParams, emailVerified, errorSlice]);

    const requestNewVerificationEmail = () => {
        if (user?.loggedIn) {
            if (!user?.email) {
                dispatch(showErrorToast(
                    "Email verification request failed.",
                    "You are not logged in or don't have an e-mail address to verify."
                ));
            } else {
                void sendVerificationEmail({email: user?.email});
            }
        }
    };

    const continueToMyAda = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/dashboard");
    };

    return <div id="verify-email">
        <Container className="text-center">
            <Card className="my-9">
                <CardBody>
                    {!emailVerified && userFromParamVerificationFailed &&
                        <ExigentAlert color="warning">
                            <p className="alert-heading fw-bold">Unable to verify your email address</p>
                            <p>{getRTKQueryErrorMessage(userFromParamVerificationErrored).message}</p>
                        </ExigentAlert>
                    }
                    <Row className="justify-content-center mt-3">
                        {emailVerified ?
                            <h2>Welcome to Ada Computer Science!</h2>
                            :
                            <h2>Verify your email address</h2>
                        }
                    </Row>
                    <Row className="justify-content-center">    
                        {emailVerified ?
                            <p>You&apos;ve verified your email address and finished creating your account.</p>
                            :
                            <p>Click the link in the email we&apos;ve sent to finish setting up your account.</p>
                        }
                    </Row>
                    <Row className="justify-content-center">
                        {emailVerified ?
                            <img className="verify-graphic img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_done.png"} alt="" />
                            :
                            <img className="verify-graphic img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_request.png"} alt="" />
                        }
                    </Row>
                    {!emailVerified &&
                        <Row className="justify-content-center">
                            {verifyingCurrentUser ?
                                <>
                                    <h4 className="mb-3">Didn&apos;t get the email?</h4>
                                    <p>
                                        {verificationNotResent ?
                                            <Button onClick={requestNewVerificationEmail}>
                                                Resend verification email
                                            </Button>
                                            :
                                            "Verification email sent to " + (user && user.loggedIn && user.email)
                                        }
                                    </p>
                                    {/*<p>    TODO: Allow email address to be changed from this page
                                        <Button onClick={() => setShowEmailInput(true)} color="keyline">
                                            Change account email
                                        </Button>
                                    </p>*/}
                                </>
                                :
                                <p>If you need a new verification email, please <Link to="/login">log in</Link> first.</p>
                            }
                        </Row>
                    }
                    {verifyingCurrentUser ?
                        emailVerified &&
                            <Row className="justify-content-center">
                                <p>
                                    <Button className="my-3" onClick={continueToMyAda}>
                                        Continue to My Ada
                                    </Button>
                                </p>
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
    </div>;
};
