import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {siteSpecific} from "../../services";
import { useNavigate } from "react-router";
import { Spacer } from "../elements/Spacer";


export const RegistrationSuccess = () => {
    const navigate = useNavigate();

    const myAccount = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/account");
    };

    const continueToPreferences = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/preferences");
    };

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };

    return siteSpecific(
        <Container>
            <Card className="my-7">
                <Row>
                    <Col sm={7} className="py-3 d-flex flex-column align-items-start px-5">
                        <h3>Account created!</h3>
                        <p>You&apos;re all set up and ready to go!</p>
                        <Spacer />
                        <Button className={"d-none d-sm-block my-2"} onClick={returnToHomepage}>Home</Button>
                    </Col>
                    <Col sm={5}>
                        <div className="rounded-4 login-flow-bg d-flex justify-content-center align-items-center">
                            <img className="w-60 py-5" src="/assets/phy/decor/science-tick.svg" alt="" />
                        </div>
                        <div className="mx-3 d-sm-none">
                            <Button className={"w-100 my-3"} onClick={returnToHomepage}>Home</Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </Container>, 
        <Container className="text-center">
            <Card className="my-7">
                <CardBody>
                    <Row className="justify-content-center">
                        <Col>
                            <h3>Account created!</h3>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col>
                            {siteSpecific(
                                <img className="img-fluid mx-auto mt-3 mb-4" src="/assets/common/icons/check.svg" alt="" id="registration-complete-tick" />,
                                <img className="img-fluid mx-auto my-7 w-md-50" src="/assets/cs/decor/verify_done.png" alt="" />
                            )}
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col xs={12} sm={6} lg={3}>
                            {siteSpecific(
                                <Button className={"my-2"} color="solid" onClick={returnToHomepage}>Home</Button>,
                                <Button className={"my-2"} color="keyline" onClick={myAccount}>Your account</Button>
                            )}
                        </Col>
                        <Col xs={12} sm={6} lg={3}>
                            <Button className={"my-2"} onClick={continueToPreferences}>{siteSpecific("Preferences", "Continue")}</Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Container>
    );
};
