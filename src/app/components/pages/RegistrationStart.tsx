import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";
import {history, isAda, SITE_TITLE, siteSpecific} from "../../services";

export const RegistrationStart = () => {

    const emailSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        // TODO: push /register/role on both sites when teacher registration is implemented on phy
        history.push(siteSpecific("register/student/age", "/register/role"));
    };

    const login = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/login");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <Row className="align-items-start">
                    <Col xs={12} lg={6}>
                        <div className="mb-5">
                            <h2>{siteSpecific("Hello!", "How would you like to sign up?")}</h2>
                            <p>Here, you can create an {SITE_TITLE} account, or log in to an existing one.</p>
                        </div>
                        <div className="my-5">
                            <h3>Create a new account with your email:</h3>
                            <Button block onClick={emailSignUp}>Continue with email</Button>
                        </div>
                        <div className="my-5">
                            <h3>Or log in with:</h3>
                            {isAda && <div className="mb-2">
                                <RaspberryPiSignInButton />
                            </div>}
                            <GoogleSignInButton />
                        </div>
                        <hr />
                        <div className="mt-5">
                            <h3>Already have an account?</h3>
                            <Button color="secondary" outline block onClick={login}>Log in</Button>
                        </div>
                    </Col>
                    <Col xs={12} lg={6}>
                        {siteSpecific(
                            <img className="d-none d-lg-block img-fluid mx-auto p-2 border-radius-3" src={"/assets/phy/decor/physics-bg-3x5.png"} alt="" />,
                            <img className="d-none d-lg-block img-fluid mx-auto" src={"/assets/cs/decor/register-3x4.png"} alt="" />
                        )}
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
