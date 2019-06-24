import React, {useEffect, useState} from 'react';
import {handleEmailAlter, requestEmailVerification} from "../../state/actions";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {AppState, ErrorState} from "../../state/reducers";
import {Link} from "react-router-dom";
import queryString from "query-string";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {connect} from "react-redux";
import {LoggedInUser} from "../../../IsaacAppTypes";
const stateToProps = (state: AppState, {location: {search}}: {location: {search?: string}}) => ({
    errorMessage: state ? state.error : null,
    queryParams: search ? queryString.parse(search) : {}
});
const dispatchToProps = {handleEmailAlter, requestEmailVerification};

interface EmailAlterHandlerProps {
    user: LoggedInUser | null;
    queryParams: {userid?: string; token?: string};
    handleEmailAlter: (params: {userid: string | null; token: string | null}) => void;
    errorMessage: ErrorState;
    requestEmailVerification: () => void;
}

const EmailAlterHandlerComponent = (props: EmailAlterHandlerProps) => {
    const {user, queryParams: {userid, token}, handleEmailAlter, errorMessage, requestEmailVerification} = props;
    const [verificationReSent, setVerificationReSent] = useState(false);
    const validParameters = userid && token;
    const idsMatch = user && user.loggedIn && user.id == userid;
    const emailVerified = user && user.loggedIn && user.emailVerificationStatus === "VERIFIED";

    const emailVerificationSuccess = validParameters && idsMatch && emailVerified;

    useEffect(() => {
        if (userid && token && idsMatch) {
            handleEmailAlter({userid, token});
        }
    }, [userid, token, handleEmailAlter]);

    return <Container id="email-verification">
        <TitleAndBreadcrumb currentPageTitle="Email verification" />
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card className="my-5 text-center">
                    <CardBody className="m-4">
                        {/* Isaac Physics had a large icon here */}

                        {emailVerificationSuccess ?
                            <React.Fragment>
                                <h3 className="mb-4">Email address verified</h3>
                                <Button tag={Link} to="/account" color="secondary" block>
                                    Continue to My Account
                                </Button>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <h3 className="mb-4">Couldn&apos;t verify email address</h3>
                                <p className="m-0">
                                    {!validParameters && "This page received bad parameters."}
                                    {validParameters && !idsMatch && "You are not signed in as the user for which you are trying to verify an email."}
                                    {errorMessage && errorMessage.type === "generalError" && errorMessage.generalError}
                                </p>
                                {idsMatch && <p className="mt-4">
                                    {!verificationReSent ?
                                        <Button onClick={() => {
                                            requestEmailVerification();
                                            setVerificationReSent(true);
                                        }}>
                                            Resend verification email
                                        </Button>
                                        :
                                        "Verification email sent to " + (user && user.loggedIn && user.email)
                                    }
                                </p>}
                            </React.Fragment>
                        }
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};

export const EmailAlterHandler = connect(stateToProps, dispatchToProps)(EmailAlterHandlerComponent);
