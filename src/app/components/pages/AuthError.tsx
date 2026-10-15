import React, { ReactNode } from "react";
import {Link, useLocation} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { Container, Row, Col } from "reactstrap";
import { type fetchErrorFromParameters } from "../../state";
import { isPhy, SITE_TITLE_SHORT } from "../../services";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

type State = { errorMessage?: string, provider?: string, providerErrors: ReturnType<typeof fetchErrorFromParameters>};

export const AuthError = () => {
    const { t } = useTranslation();
    const location = useLocation();
    return <Container role="region" aria-label={t("common:auth.page.ariaLabel")}>
        <TitleAndBreadcrumb currentPageTitle={t("common:auth.page.title")} breadcrumbTitleOverride={t("common:auth.page.breadcrumbTitle")} icon={{type: "icon", icon: "icon-error"}}/>
        <Row className="pt-4">
            <Col>
                <ErrorMessage state={location.state}/>
            </Col>
        </Row>
    </Container>;
};

const ErrorMessage = ({ state }: { state?: State }) => {
    if (state?.errorMessage?.startsWith('You do not use')) {
        return <AccountNotLinked state={state}/>;
    } else if (state?.provider === 'microsoft' && state?.providerErrors?.errorDescription?.startsWith('AADSTS65004')) {
        return <ConsentMissingMicrosoft/>;
    } else {
        return <GenericError state={state}/>;
    }
};

const GenericError = ({ state }: { state?: State }) => <>
    <h2 className="h3">
        {state?.errorMessage || ""}
    </h2>
    <p>
        An error occurred while attempting to log in.
        <br />
        You may want to return to the <Link to="/"> home page</Link> and try again, {" "}
        check <Link to="/support/student/general#login_issues">this FAQ</Link>,
        or <ContactUs /> if this keeps happening.
    </p>
</>;

const AccountNotLinked  = ({ state }: { state?: State }) => {
    const { t } = useTranslation();
    const provider = state?.provider === 'google' ? "Google" : "Microsoft";

    return <>
        <h2 className="h3">{t("common:auth.notLinked.title", { provider })}</h2>
        <p>
            {t("common:auth.notLinked.explanation", { siteName: SITE_TITLE_SHORT, provider, siteAccountName: SITE_TITLE_SHORT, providerAccount: provider, signInProvider: provider, siteAccount: SITE_TITLE_SHORT, alternateProvider: provider })}
        </p>
        <ul>
            <li>
                <Trans i18nKey="site:auth.notLinked.enableSignIn" components={{ accountLink: <Link to="/account#security" aria-label={t("common:auth.accountLink.ariaLabel")} /> }} values={{ provider, providerSetting: provider }} />
                <SSOLink> {t("common:auth.notLinked.readMore", { provider })}</SSOLink>
            </li>
            <li>
                <Trans i18nKey="common:auth.notLinked.switchAccount" components={{ accountLink: <Link to="/account#security" aria-label={t("common:auth.accountLink.ariaLabel")} /> }} values={{ provider, linkedProvider: provider }} />
            </li>
        </ul>
        <p>If you need more help signing in, <ContactUs/>.</p>
    </>;
};

const ConsentMissingMicrosoft = () => <>
    <h2 className="h3">{i18next.t("common:auth.consent.title")}</h2>
    <p>
        {i18next.t("common:auth.consent.explanation", { siteTitle: SITE_TITLE_SHORT })}
    </p>
    <p>
        {i18next.t("common:auth.consent.schoolNote", { siteName: SITE_TITLE_SHORT, approvedSiteName: SITE_TITLE_SHORT })} <SSOLink>{i18next.t("common:auth.consent.readMore")}</SSOLink>
    </p>
    <p>If you need more help signing in, <ContactUs />.</p>
</>;

const SSOLink = ({ children }: { children: ReactNode}) => isPhy && 
    <Link to="/pages/single_sign_on" aria-label={i18next.t("sci:auth.sso.ariaLabel")}>{children}</Link>;

const ContactUs = () => <Link to="/contact" aria-label={i18next.t("common:auth.contact.ariaLabel")}>{i18next.t("common:auth.contact.link")}</Link>;
