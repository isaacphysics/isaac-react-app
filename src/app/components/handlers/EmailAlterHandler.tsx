import React, {useEffect} from 'react';
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {
    useAppSelector,
    selectors,
    useAppDispatch,
    showErrorToast,
    getRTKQueryErrorMessage,
    useRequestEmailVerificationMutation,
    useVerifyEmailMutation
} from "../../state";
import {Link} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useQueryParams} from "../../services";

export const EmailAlterHandler = () => {
    const dispatch = useAppDispatch();

    const {userid, token} = useQueryParams(true);

    const user = useAppSelector(selectors.user.orNull);
    const idsMatch = user && user.loggedIn && user.id === Number(userid);

    const [verifyEmail, {isSuccess: emailVerificationSuccess, isError: emailVerificationFailed, error: emailVerificationError, isUninitialized: emailVerificationNotInitiated}] = useVerifyEmailMutation();
    const [sendVerificationEmail, {isUninitialized: verificationNotResent}] = useRequestEmailVerificationMutation();

    const successMessage = idsMatch
        ? "Email address verified."
        : "You are signed in as a different user to the user with the email you have just verified.";

    useEffect(() => {
        if (userid && token) {
            void verifyEmail({userid, token});
        }
    }, [verifyEmail, userid, token]);

    return <Container id="email-verification">
        <TitleAndBreadcrumb 
            currentPageTitle="Email verification"
            icon={{type: "icon", icon: "icon-mail"}}
        />
        <Row>
            <Col md={{offset: 1, size: 10}} lg={{offset: 2, size: 8}} xl={{offset: 3, size: 6}}>
                <Card className="my-7 text-center">
                    <CardBody className="m-4">
                        {emailVerificationSuccess &&
                            <>
                                <div className="mb-4 h3">{successMessage}</div>
                                <Button tag={Link} to="/" color="secondary" block>
                                    Continue
                                </Button>
                            </>}
                        {emailVerificationFailed &&
                            <>
                                <div className="mb-4 h3">Couldn&apos;t verify email address</div>
                                <p>{getRTKQueryErrorMessage(emailVerificationError).message}</p>
                                {idsMatch
                                    ? <p>
                                        {verificationNotResent ?
                                            <Button onClick={() => {
                                                if (!user.email) {
                                                    dispatch(showErrorToast(
                                                        "Email verification request failed.",
                                                        "You are not logged in or don't have an e-mail address to verify."
                                                    ));
                                                } else {
                                                    void sendVerificationEmail({email: user.email});
                                                }
                                            }}>
                                                Resend verification email
                                            </Button>
                                            :
                                            "Verification email sent to " + (user && user.loggedIn && user.email)
                                        }
                                    </p>
                                    : <p>Please login to your <Link to="/account">account</Link> to resend the verification email.</p>
                                }
                            </>
                        }
                        {emailVerificationNotInitiated && <>
                            <div className="mb-4 h3">Couldn&apos;t verify email address</div>
                            <p>This page received bad parameters. Please ensure you are using the link as provided in the email.</p>
                        </>}
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
