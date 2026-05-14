import React, {useState} from 'react';
import {
    selectors,
    useAppSelector,
    useRequestEmailVerificationMutation
} from "../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from 'reactstrap';
import {SITE_TITLE_SHORT, siteSpecific, WEBMASTER_EMAIL} from "../../services";
import { useTranslation, Trans } from 'react-i18next'

export const EmailVerificationBanner = () => {
    const { t } = useTranslation()
    const [hidden, setHidden] = useState(false);
    const user = useAppSelector(selectors.user.orNull);
    const status = user?.loggedIn && user?.emailVerificationStatus || null;
    const show = user?.loggedIn && status != "VERIFIED" && !hidden;

    const [sendVerificationEmail] = useRequestEmailVerificationMutation();
    function clickVerify() {
        if (user?.loggedIn && user.email) {
            void sendVerificationEmail({email: user.email});
        }
        setHidden(true);
    }

    return show ? <div className="banner d-print-none" id="email-status-banner">
        <Container className="py-3">

            <Row style={{alignItems: "center"}}>
                <Col xs={12} sm={siteSpecific(2, 1)} md={1}>
                    <h3 className="text-center">
                        <img className={siteSpecific("mt-n2 mt-sm-0 mt-md-n1", "mt-n1 mt-sm-1")} src="/assets/common/icons/info.svg" style={{height: "1.5rem"}}
                            alt="" aria-labelledby="email-verification-heading"/>
                        <span id="email-verification-heading" className="d-inline-block d-sm-none">{t('nbspemailVerification', '&nbsp;Email Verification')}</span>
                    </h3>
                </Col>
                {(status == null || status == "NOT_VERIFIED") && <React.Fragment>
                    <Col xs={12} sm={siteSpecific(10, 7)} md={8}>
                        {t('yourEmailAddressIsNotVerifiedPleaseFindOurEmailInYourInboxAndFollowTheVerificationLinkYouCan', 'Your email address is not verified - please find our email in your inbox and follow the\n                        verification link. You can')}{" "}
                        <Button color="link primary-font-link" onClick={clickVerify} id="email-verification-request">
                            {t('requestANewVerificationEmail', 'request a new verification email')}
                        </Button>{" "}
                        {t('ifNecessaryToChangeYourAccountEmailGoTo', 'if necessary. To change your account email,\n                        go to')} <Link to="/account">{t('myAccount', 'My account')}</Link>.
                    </Col>
                    <Col xs={12} sm={siteSpecific(12, 2)} md={3} className="text-center">
                        <Button
                            color={siteSpecific("keyline", "solid")} className="mt-3 mb-2 d-block d-md-inline-block banner-button"
                            onClick={() => setHidden(true)} id="email-verification-snooze"
                        >
                            {t('snooze', 'Snooze')}
                        </Button>
                    </Col>
                </React.Fragment>}
                {(status == "DELIVERY_FAILED") &&
                    <Col xs={12} sm={10} md={11}><Trans i18nKey="oneOrMoreEmailsSentToYourEmailAddressFailedThisMeansYouWonapostReceiveEmailsFromSite_title_shortAndMayPreventYouRegainingAccessToYourAccountBrtoStartReceivingEmailsAgainUpdateYourEmailAddressOnYour">One or more email(s) sent to your email
                        address failed. This means you won&apos;t receive emails from {{ SITE_TITLE_SHORT }}, and may prevent you
                        regaining access to your account. <br/>To start receiving emails again, update your email
                        address on your</Trans><Link to="/account">{t('myAccount', 'My account')}</Link><Trans i18nKey="pageIfYouBelieveThisIsInErrorPleaseAHrefmailtowebmaster_emailemailUsa">page. If you believe this is in
                        error, please <a href={`mailto:${WEBMASTER_EMAIL}`}>email us</a>.</Trans></Col>
                }
            </Row>
        </Container>
    </div> : null;
};
