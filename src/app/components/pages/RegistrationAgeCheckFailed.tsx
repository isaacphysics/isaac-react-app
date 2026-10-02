import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {isAda, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { Trans, useTranslation } from "react-i18next";

export const RegistrationAgeCheckFailed = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.ageCheckFailed.title", { siteTitle: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <h3>{t("common:auth.ageCheckFailed.heading")}</h3>
                <p>{t("site:auth.ageCheckFailed.ageRestriction")}</p>
                <p>{siteSpecific(
                    <><Trans i18nKey="sci:auth.ageCheckFailed.freeAccessNote" components={{ b: <b /> }} /></>,
                    <><Trans i18nKey="ada:auth.ageCheckFailed.freeAccessNote" components={{ b: <b /> }} /></>
                )}</p>
                {isAda && <hr/>}
                <Row className="justify-content-end">
                    {isAda && <Col sm={4} lg={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>{t("common:auth.ageCheckFailed.backButton")}</Button>
                    </Col>}
                    <Col sm={6} lg={4}>
                        <Button className="mt-2 w-100" color="solid" onClick={returnToHomepage}>{t("site:auth.ageCheckFailed.returnButton")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
