import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {isAda, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { useTranslation, Trans } from 'react-i18next'

export const RegistrationAgeCheckFailed = () => {
    const { t } = useTranslation()
    const navigate = useNavigate();

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t('createAnSite_titleAccount', 'Create an {{SITE_TITLE}} account', { SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <h3>{t('unableToCreateAccount', 'Unable to create account')}</h3>
                <p>{t('unfortunatelyWeArenapostAbleToOfferAccountsToStudentsUnder', 'Unfortunately, we aren&apos;t able to offer accounts to students under')} {siteSpecific("10", "13")} {t('yearsOld', 'years old.')}</p>
                <p>{siteSpecific(
                    <><Trans i18nKey="bbutYouCanStillAccessTheWholeSiteForFreebYouJustWonapostBeAbleToTrackYourProgress"><b>But you can still access the whole site for free!</b> You just won&apos;t be able to track your progress.</Trans></>,
                    <><Trans i18nKey="bhoweverYouCanStillAccessTheWholeSiteForFreebHoweverYouWillNotBeAbleToTrackYourProgress"><b>However, you can still access the whole site for free!</b> However you will not be able to track your progress.</Trans></>
                )}</p>
                {isAda && <hr/>}
                <Row className="justify-content-end">
                    {isAda && <Col sm={4} lg={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>{t('back', 'Back')}</Button>
                    </Col>}
                    <Col sm={6} lg={4}>
                        <Button className="mt-2 w-100" color="solid" onClick={returnToHomepage}>{siteSpecific(t('takeMeBack', 'Take me back'), "Back to the site")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
