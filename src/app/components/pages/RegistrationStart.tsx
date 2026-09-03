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
import classNames from "classnames";

export const RegistrationStart = () => {
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
            <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
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
                            <h2>{siteSpecific("Hello!", "How would you like to sign up?")}</h2>
                            <p>Here, you can create an {SITE_TITLE} account, or log in to an existing one.</p>
                        </div>
                        <div className="my-7">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>Create a new account with your email:</h3>
                            <Button block onClick={emailSignUp}>Continue with email</Button>
                        </div>
                        <div className="my-7">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>Or log in with:</h3>
                            <div className="d-flex flex-column gap-2 mb-2">
                                {isAda && <RaspberryPiSignInButton />}
                                <GoogleSignInButton />
                                <MicrosoftSignInButton />
                            </div>
                            {isPhy && <SsoHelpLink />}                            
                        </div>
                        {siteSpecific(<div className="section-divider"/>, <hr/>)}
                        <div className="mt-7">
                            <h3 className={classNames({"h4 mb-3": isPhy})}>Already have an account?</h3>
                            <Button color={siteSpecific("solid", "keyline")} block onClick={login}>Log in</Button>
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
