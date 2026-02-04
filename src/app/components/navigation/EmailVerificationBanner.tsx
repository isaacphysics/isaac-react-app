import React, {useState} from 'react';
import {
    selectors,
    useAppSelector,
    useRequestEmailVerificationMutation
} from "../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from 'reactstrap';
import {SITE_TITLE_SHORT, siteSpecific, WEBMASTER_EMAIL} from "../../services";

export const EmailVerificationBanner = () => {
    const [hidden, setHidden] = useState(false);
    const user = useAppSelector(selectors.user.orNull);
    const status = user?.loggedIn && user?.emailVerificationStatus || null;
    const show = user?.loggedIn && status != "VERIFIED" && !hidden;

    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    function clickVerify() {
        if (user?.loggedIn && user.email) {
            sendVerificationEmail({email: user.email});
        }
        setHidden(true);
    }

    return show ? <div className="banner d-print-none" id="email-status-banner">
        <Container className="py-3">

            <Row style={{alignItems: "center"}}>
                <Col xs={12} sm={2} md={1}>
                    <h3 className="text-center">
                        <img className={siteSpecific("mt-n2 mt-sm-0 mt-md-n1", "mt-n1 mt-sm-1")} src="/assets/common/icons/info.svg" style={{height: "1.5rem"}}
                            alt="" aria-labelledby="email-verification-heading"/>
                        <span id="email-verification-heading" className="d-inline-block d-sm-none">&nbsp;Email Verification</span>
                    </h3>
                </Col>
                {(status == null || status == "NOT_VERIFIED") && <React.Fragment>
                    <Col xs={12} sm={10} md={8}>
                        <small>
                            Your email address is not verified - please find our email in your inbox and follow the
                            verification link. You can{" "}
                            <Button color="link primary-font-link" onClick={clickVerify} id="email-verification-request">
                                request a new verification email
                            </Button>{" "}
                            if necessary. To change your account email,
                            go to <Link to="/account">My account</Link>.
                        </small>
                    </Col>
                    <Col xs={12} md={3} className="text-center">
                        <Button
                            color={siteSpecific("keyline", "solid")} className="mt-3 mb-2 d-block d-md-inline-block banner-button"
                            onClick={() => setHidden(true)} id="email-verification-snooze"
                        >
                            Snooze
                        </Button>
                    </Col>
                </React.Fragment>}
                {(status == "DELIVERY_FAILED") &&
                    <Col xs={12} sm={10} md={11}>
                        <small>One or more email(s) sent to your email
                            address failed. This means you won&apos;t receive emails from {SITE_TITLE_SHORT}, and may prevent you
                            regaining access to your account. <br/>To start receiving emails again, update your email
                            address on your <Link to="/account">My account</Link> page. If you believe this is in
                            error, please <a href={`mailto:${WEBMASTER_EMAIL}`}>email us</a>.
                        </small>
                    </Col>
                }
            </Row>
        </Container>
    </div> : null;
};
