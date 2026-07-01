import React, {useMemo, useState} from 'react';
import {
    selectors,
    useAppSelector,
    useRequestEmailVerificationMutation
} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Row} from 'reactstrap';
import {SITE_TITLE_SHORT, siteSpecific, useUserConsent, WEBMASTER_EMAIL} from "../../../services";
import { EmailVerificationStatus } from '../../../../IsaacApiTypes';
import { DismissibleBanner } from './DismissibleBanner';

interface EmailVerificationBannerProps {
    setHidden: React.Dispatch<React.SetStateAction<boolean>>;
    status: EmailVerificationStatus | null;
}

const EmailVerificationBannerBody = ({setHidden, status}: EmailVerificationBannerProps) => {
    const user = useAppSelector(selectors.user.orNull);

    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    function clickVerify() {
        if (user?.loggedIn && user.email) {
            void sendVerificationEmail({email: user.email});
        }
        setHidden(true);
    }

    return <Row className="align-items-center" id="email-status-banner">
        <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
            <h3 className="d-flex align-items-center justify-content-center gap-2">
                <i className="icon icon-info icon-sm icon-color-black" aria-hidden="true" />
                <span id="email-verification-heading" className="d-inline-block d-sm-none">&nbsp;Email Verification</span>
            </h3>
        </Col>
        {(status == null || status == "NOT_VERIFIED") && <React.Fragment>
            <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
                Your email address is not verified - please find our email in your inbox and follow the
                verification link. You can{" "}
                <Button color="link primary-font-link" onClick={clickVerify} id="email-verification-request">
                    request a new verification email
                </Button>{" "}
                if necessary. To change your account email,
                go to <Link to="/account">My account</Link>.
            </Col>
        </React.Fragment>}
        {(status == "DELIVERY_FAILED") &&
            <Col xs={12} sm={siteSpecific(10, 11)} md={11}>
                One or more email(s) sent to your email
                address failed. This means you won&apos;t receive emails from {SITE_TITLE_SHORT}, and may prevent you
                regaining access to your account. <br/>To start receiving emails again, update your email
                address on your <Link to="/account">My account</Link> page. If you believe this is in
                error, please <a href={`mailto:${WEBMASTER_EMAIL}`}>email us</a>.
            </Col>
        }
    </Row>;
};

export const EmailVerificationBanner = () => {
    const [hidden, setHidden] = useState(false);
    const user = useAppSelector(selectors.user.orNull);
    const {cookieConsent} = useUserConsent();
    const isHiddenViaCookie = !!(user?.loggedIn && user?.emailVerificationStatus === "DELIVERY_FAILED" && cookieConsent?.disableEmailVerificationWarningCookiesAccepted);
    const status = user?.loggedIn && user?.emailVerificationStatus || null;
    const show = useMemo(() => user?.loggedIn && status != "VERIFIED" && !hidden && !isHiddenViaCookie, [user, status, hidden, isHiddenViaCookie]);

    return <DismissibleBanner
        dismissText={"Snooze"}
        theme={"light"}
        show={!!show}
    >
        <EmailVerificationBannerBody setHidden={setHidden} status={status} />
    </DismissibleBanner>;
};
