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
import { Trans, useTranslation } from "react-i18next";

export const EmailAlterHandler = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const {userid, token} = useQueryParams(true);

    const user = useAppSelector(selectors.user.orNull);
    const idsMatch = user && user.loggedIn && user.id === Number(userid);

    const [verifyEmail, {isSuccess: emailVerificationSuccess, isError: emailVerificationFailed, error: emailVerificationError, isUninitialized: emailVerificationNotInitiated}] = useVerifyEmailMutation();
    const [sendVerificationEmail, {isUninitialized: verificationNotResent}] = useRequestEmailVerificationMutation();

    const successMessage = idsMatch
        ? t("common:auth.emailVerification.verified")
        : t("common:auth.emailVerification.userMismatch");

    useEffect(() => {
        if (userid && token) {
            void verifyEmail({userid, token});
        }
    }, [verifyEmail, userid, token]);

    return <Container id="email-verification">
        <TitleAndBreadcrumb 
            currentPageTitle={t("common:auth.emailVerification.title")}
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
                                    {t("common:auth.emailVerification.continueButton")}
                                </Button>
                            </>}
                        {emailVerificationFailed &&
                            <>
                                <div className="mb-4 h3">{t("common:auth.emailVerification.failedTitle")}</div>
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
                                                {t("common:auth.emailVerification.resendButton")}
                                            </Button>
                                            :
                                            t("common:auth.emailVerification.sentTo", { email: (user && user.loggedIn && user.email) })
                                        }
                                    </p>
                                    : <p><Trans
                                        i18nKey="common:auth.emailVerification.loginToResend"
                                        components={{
                                            accountLink: <Link to="/account" />,
                                        }}
                                    /></p>
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
