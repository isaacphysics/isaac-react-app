import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {AUTHENTICATOR_FRIENDLY_NAMES_MAP, AUTHENTICATOR_PROVIDERS, isAda, isPhy, SITE_LOWER_AGE_LIMIT, SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { RaspberryPiSignInButton } from "../elements/RaspberryPiSignInButton";
import { GoogleSignInButton } from "../elements/GoogleSignInButton";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { SsoHelpLink } from "../elements/LogInInputs";
import { Trans, useTranslation } from "react-i18next";

export const RegistrationAgeCheckSSOOnly = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };
    
    const authProviderListString = AUTHENTICATOR_PROVIDERS
        .map(auth => AUTHENTICATOR_FRIENDLY_NAMES_MAP[auth])
        .reduce((acc, curr, index, arr) => {
            if (index === 0) return curr;
            return index === arr.length - 1
                ? acc + " or " + curr
                : acc + ", " + curr;
        }, "");

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.register.pageTitle", { siteName: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <h3>{t("common:auth.registration.ageCheck.heading")}</h3>
                <p><Trans
                    i18nKey="common:auth.registration.ageCheck.message"
                    components={{
                        strong: <strong />,
                    }}
                    values={{ minAge: SITE_LOWER_AGE_LIMIT, maxAge: SITE_LOWER_AGE_LIMIT_WITHOUT_PARENTAL_CONSENT - 1 }}
                /></p>
                <p>{t("common:auth.registration.ageCheck.tryOtherProvider", { authProviders: authProviderListString })}</p>
                {isAda && <hr/>}
                <div className="d-flex flex-column gap-2">
                    {isAda && <RaspberryPiSignInButton knownRole="STUDENT" />}
                    <GoogleSignInButton knownRole="STUDENT" />
                    <MicrosoftSignInButton knownRole="STUDENT" />
                    {isPhy && <SsoHelpLink />}
                </div>
                <Row className="justify-content-end">
                    <Col sm={4} lg={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>{t("common:auth.registration.ageCheck.backButton")}</Button>
                    </Col>
                    <Col sm={6} lg={4}>
                        <Button className="mt-2 w-100" color="solid" onClick={returnToHomepage}>{t("site:auth.register.homeButton")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
