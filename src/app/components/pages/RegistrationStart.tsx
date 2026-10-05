import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";
import {isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { SsoHelpLink } from "./LogIn";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { useTranslation } from "react-i18next";

export const RegistrationStart = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const emailSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        // TODO: push /register/role on both sites when teacher registration is implemented on phy
        void navigate(siteSpecific("/register/student/age", "/register/role"));
    };

    const login = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/login");
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:auth.registration.pageTitle", { siteTitle: SITE_TITLE })} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={0}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <Row className="align-items-start">
                    <Col xs={12} lg={6}>
                        <div className="mb-7">
                            <h2>{t("site:auth.register.heading")}</h2>
                            <p>{t("common:auth.register.description", { siteTitle: SITE_TITLE })}</p>
                        </div>
                        <div className="my-7">
                            <div className={siteSpecific("h4 mb-3", "h3")}>{t("common:auth.register.emailHeading")}</div>
                            <Button block onClick={emailSignUp}>{t("common:auth.register.continueWithEmail")}</Button>
                        </div>
                        <div className="my-7">
                            <div className={siteSpecific("h4 mb-3", "h3")}>{t("common:auth.register.ssoHeading")}</div>
                            <div className="d-flex flex-column gap-2 mb-2">
                                {isAda && <RaspberryPiSignInButton />}
                                <GoogleSignInButton />
                                <MicrosoftSignInButton />
                            </div>
                            {isPhy && <SsoHelpLink />}                            
                        </div>
                        {siteSpecific(<div className="section-divider"/>, <hr/>)}
                        <div className="mt-7">
                            <div className={siteSpecific("h4 mb-3", "h3")}>{t("common:auth.register.existingAccount")}</div>
                            <Button color={siteSpecific("solid", "keyline")} block onClick={login}>{t("common:button.logIn")}</Button>
                        </div>
                    </Col>
                    <Col xs={12} lg={6}>
                        {siteSpecific(
                            <img className="d-none d-lg-block img-fluid mx-auto p-2 border-radius-3" src={"/assets/phy/decor/physics-bg-light-3x5.png"} alt="" />,
                            <img className="d-none d-lg-block img-fluid mx-auto" src={"/assets/cs/decor/register-3x4.png"} alt="" />
                        )}
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
