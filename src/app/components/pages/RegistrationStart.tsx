import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";
import {isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { SsoHelpLink } from "../elements/LogInInputs";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import classNames from "classnames";
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
        <Card className="my-5">
            <CardBody>
                <Row className="align-items-start">
                    <Col xs={12} lg={6}>
                        <div className="mb-5">
                            {siteSpecific(
                                <>
                                    <h3>{t("sci:auth.register.greetingTitle")}</h3>
                                    <p>{t("sci:auth.register.greetingDescription", { siteTitle: SITE_TITLE })}</p>
                                </>,
                                <>
                                    <h3>{t("ada:auth.register.signupChoiceTitle")}</h3>
                                    <p>{t("ada:auth.register.signupChoiceDescription")}</p>
                                </>
                            )}
                        </div>
                        <div className="my-7">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>{t("common:auth.registration.socialSignIn.title")}</h3>
                            <div className="d-flex flex-column gap-2 mb-2">
                                {isAda && <RaspberryPiSignInButton />}
                                <GoogleSignInButton />
                                <MicrosoftSignInButton />
                            </div>
                            {isPhy && <SsoHelpLink />}                            
                        </div>
                        <div className="my-5">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>{t("common:auth.registration.emailSection.title")}</h3>
                            <Button block onClick={emailSignUp}>{t("common:auth.registration.emailSection.button")}</Button>
                        </div>
                        {siteSpecific(<div className="section-divider"/>, <hr/>)}
                        <div className="my-5">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>{t("common:auth.register.existingAccount")}</h3>
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
