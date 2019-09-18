import React, {useEffect, useState} from 'react';
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {Link} from "react-router-dom";
import queryString from "query-string";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {handleEmailAlter, requestEmailVerification} from "../../state/actions";

export const EmailAlterHandler = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const errorMessage = useSelector((state: AppState) => state && state.error);

    const {userid, token}: {userid?: string; token?: string} = queryString.parse(location.search);
    const [verificationReSent, setVerificationReSent] = useState(false);
    const validParameters = userid && token;
    const idsMatch = user && user.loggedIn && user.id == userid;
    const emailVerified = user && user.loggedIn && user.emailVerificationStatus === "VERIFIED";

    const emailVerificationSuccess = validParameters && idsMatch && emailVerified;

    let successMessage = "Email address verification token received. Log in to confirm verification.";
    if (emailVerificationSuccess) {
        successMessage = "Email address verified";
    } else if (!errorMessage && user && user.loggedIn && user.id != userid) {
        successMessage = "You are signed in as a different user to the user with the email you have just verified. Log in as the other user to confirm verification.";
    }

    useEffect(() => {
        if (userid && token) {
            dispatch(handleEmailAlter({userid, token}));
        }
    }, [userid, token]);

    return <Container id="email-verification">
        <TitleAndBreadcrumb currentPageTitle="Email verification" />
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card className="my-5 text-center">
                    <CardBody className="m-4">
                        {/* Isaac Physics had a large icon here */}

                        {(!errorMessage || emailVerificationSuccess) &&
                            <React.Fragment>
                                <h3 className="mb-4">{successMessage}</h3>
                                <Button tag={Link} to="/account" color="secondary" block>
                                    Continue to My Account
                                </Button>
                            </React.Fragment>}
                        {!emailVerificationSuccess && errorMessage &&
                            <React.Fragment>
                                <h3 className="mb-4">Couldn&apos;t verify email address</h3>
                                <p className="m-0">
                                    {!validParameters && "This page received bad parameters."}
                                    {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                                </p>
                                {idsMatch ? <p className="mt-4">
                                    {!verificationReSent ?
                                        <Button onClick={() => {
                                            dispatch(requestEmailVerification());
                                            setVerificationReSent(true);
                                        }}>
                                            Resend verification email
                                        </Button>
                                        :
                                        "Verification email sent to " + (user && user.loggedIn && user.email)
                                    }
                                </p>
                                :
                                <p>Please login to resend the verification email.</p>}
                            </React.Fragment>
                        }
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
