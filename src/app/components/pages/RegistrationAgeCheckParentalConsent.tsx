import React from "react";
import {Button, Card, CardBody, Col, Input, Label, Row} from "reactstrap";
import {siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { Trans, useTranslation } from "react-i18next";

export const RegistrationAgeCheckParentalConsent = () => {
    const { t } = useTranslation();

    const [parentalConsentCheckboxChecked, setParentalConsentCheckboxChecked] = React.useState<boolean>(false);

    const navigate = useNavigate();

    const continueToDetails = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/student/details");
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.parentalConsent.title")} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <p>{t("common:auth.parentalConsent.permissionIntro")}</p>
                <p><Trans i18nKey="common:auth.parentalConsent.privacyNote" components={{ privacyLink: <Link to={"/privacy"} /> }} /></p>
                <div className="d-flex align-items-center">
                    <Input
                        id="consent-checkbox" name="consent-checkbox" type="checkbox"
                        checked={parentalConsentCheckboxChecked}
                        color="primary"
                        onChange={(e) => setParentalConsentCheckboxChecked(e?.target.checked)}
                    />
                    <Label for="consent-checkbox" className="ms-2 mb-0">{t("common:auth.parentalConsent.checkboxLabel")}</Label>
                </div>
                {siteSpecific(<br/>, <hr/>)}
                <Row className="justify-content-end">
                    <Col sm={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>{t("common:button.back")}</Button>
                    </Col>
                    <Col sm={4} lg={3}>
                        <Button className={classNames("mt-2 w-100")} color="solid" onClick={continueToDetails} disabled={!parentalConsentCheckboxChecked}>{t("common:button.continue")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
