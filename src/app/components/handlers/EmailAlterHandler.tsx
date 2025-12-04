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

    const [verifyEmail, {isSuccess: emailVerificationSuccess, isError: emailVerificationFailed, error: emailVerificationError}] = useVerifyEmailMutation();
    const [sendVerificationEmail, {isUninitialized: verificationNotResent}] = useRequestEmailVerificationMutation();

    const successMessage = idsMatch
        ? "Email address verified."
        : "You are signed in as a different user to the user with the email you have just verified.";

    useEffect(() => {
        if (userid && token) {
            verifyEmail({userid, token});
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
                        {/* Isaac Physics had a large icon here */}

                        {emailVerificationSuccess &&
                            <>
                                <h3 className="mb-4">{successMessage}</h3>
                                <Button tag={Link} to="/" color="secondary" block>
                                    Continue
                                </Button>
                            </>}
                        {emailVerificationFailed &&
                            <>
                                <h3 className="mb-4">Couldn&apos;t verify email address</h3>
                                <p className="m-0">
                                    {(!userid || !token) && "This page received bad parameters."}
                                    {getRTKQueryErrorMessage(emailVerificationError).message}
                                </p>
                                {idsMatch
                                    ? <p className="mt-4">
                                        {verificationNotResent ?
                                            <Button onClick={() => {
                                                if (!user.email) {
                                                    dispatch(showErrorToast(
                                                        "Email verification request failed.",
                                                        "You are not logged in or don't have an e-mail address to verify."
                                                    ));
                                                } else {
                                                    sendVerificationEmail({email: user.email});
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
                    </CardBody>
                </Card>
            </Col>
        </Row>
    </Container>;
};
