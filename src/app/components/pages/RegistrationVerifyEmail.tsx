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
import { Trans, useTranslation } from "react-i18next";


export const RegistrationVerifyEmail = () => {
    const { t } = useTranslation();
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
                    t("common:auth.verifyEmail.requestFailed"),
                    t("common:auth.verifyEmail.requestFailedMessage")
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
                            <p className="alert-heading fw-bold">{t("common:auth.verifyEmail.failedTitle")}</p>
                            <p>{getRTKQueryErrorMessage(userFromParamVerificationErrored).message}</p>
                        </ExigentAlert>
                    }
                    <Row className="justify-content-center mt-3">
                        {emailVerified ?
                            <h2>Welcome to Ada Computer Science!</h2>
                            :
                            <h2>{t("common:auth.verifyEmail.title")}</h2>
                        }
                    </Row>
                    <Row className="justify-content-center">    
                        {emailVerified ?
                            <p>{t("common:auth.verifyEmail.verifiedMessage")}</p>
                            :
                            <p>{t("common:auth.verifyEmail.unverifiedMessage")}</p>
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
                                    <h4 className="mb-3">{t("common:auth.verifyEmail.resendPrompt")}</h4>
                                    <p>
                                        {verificationNotResent ?
                                            <Button onClick={requestNewVerificationEmail}>
                                                {t("common:auth.verifyEmail.resendButton")}
                                            </Button>
                                            :
                                            t("common:auth.verifyEmail.sentMessage", { emailAddress: (user && user.loggedIn && user.email) })
                                        }
                                    </p>
                                    {/*<p>    TODO: Allow email address to be changed from this page
                                        <Button onClick={() => setShowEmailInput(true)} color="keyline">
                                            Change account email
                                        </Button>
                                    </p>*/}
                                </>
                                :
                                <p><Trans i18nKey="common:auth.verifyEmail.loginFirstMessage" components={{ loginLink: <Link to="/login" /> }} /></p>
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
                                    <p><Trans i18nKey="common:auth.verifyEmail.continueLoginMessage" components={{ loginLink: <Link to="/login" /> }} /></p>
                                </Col>
                            </Row>
                    }
                </CardBody>
            </Card>
        </Container>
    </div>;
};
