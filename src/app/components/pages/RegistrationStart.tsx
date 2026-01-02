import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";
import {isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import { SidebarLayout, MainContent } from "../elements/layout/SidebarLayout";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { SsoHelpLink } from "./LogIn";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";

export const RegistrationStart = () => {
    const navigate = useNavigate();

    const emailSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        // TODO: push /register/role on both sites when teacher registration is implemented on phy
        void navigate(siteSpecific("register/student/age", "/register/role"));
    };

    const login = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/login");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        <SidebarLayout>
            <SignupSidebar activeTab={0}/>
            <MainContent>
                <Card className="my-7">
                    <CardBody>
                        <Row className="align-items-start">
                            <Col xs={12} lg={6}>
                                <div className="mb-7">
                                    <h2>{siteSpecific("Hello!", "How would you like to sign up?")}</h2>
                                    <p>Here, you can create an {SITE_TITLE} account, or log in to an existing one.</p>
                                </div>
                                <div className="my-7">
                                    <div className={siteSpecific("h4 mb-3", "h3")}>Create a new account with your email:</div>
                                    <Button block onClick={emailSignUp}>Continue with email</Button>
                                </div>
                                <div className="my-7">
                                    <div className={siteSpecific("h4 mb-3", "h3")}>Or log in with:</div>
                                    {isAda && <div className="mb-2">
                                        <RaspberryPiSignInButton />
                                    </div>}
                                    <GoogleSignInButton />
                                    {isPhy && <div className="mt-2 mb-2">
                                        <MicrosoftSignInButton />
                                    </div>}
                                    {isPhy && <SsoHelpLink />}
                                </div>
                                {siteSpecific(<div className="section-divider"/>, <hr/>)}
                                <div className="mt-7">
                                    <div className={siteSpecific("h4 mb-3", "h3")}>Already have an account?</div>
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
            </MainContent>
        </SidebarLayout>
    </Container>;
};
