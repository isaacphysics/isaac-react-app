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
        <Card className="my-5">
            <CardBody>
                <Row className="align-items-start">
                    <Col xs={12} lg={6}>
                        <div className="mb-5">
                            {siteSpecific(
                                <>
                                    <h3>Hello!</h3>
                                    <p>Here, you can create an {SITE_TITLE} account, or log in to an existing one.</p>
                                </>,
                                <>
                                    <h3>How would you like to sign up?</h3>
                                    <p>You will have access to the same content no matter how you sign up.</p>
                                </>
                            )}
                        </div>
                        <div className="d-flex flex-column my-5 gap-2">
                            <h4>Log in with:</h4>
                            {isAda && <RaspberryPiSignInButton />}
                            <GoogleSignInButton />
                            {isPhy && <MicrosoftSignInButton />}
                            {isPhy && <SsoHelpLink />}
                        </div>
                        <div className="my-5">
                            <h4>Or use an email:</h4>
                            <Button block onClick={emailSignUp}>Sign up with email</Button>
                        </div>
                        {siteSpecific(<div className="section-divider"/>, <hr/>)}
                        <div className="my-5">
                            <h4>Already have an account?</h4>
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
