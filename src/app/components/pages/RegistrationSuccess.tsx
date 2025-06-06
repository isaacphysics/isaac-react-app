import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {history, siteSpecific} from "../../services";


export const RegistrationSuccess = () => {
    const myAccount = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/account");
    };

    const continueToPreferences = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register/preferences");
    };

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/");
    };

    return <Container className="text-center">
        <Card className="my-5">
            <CardBody>
                <Row className="justify-content-center">
                    <Col>
                        <h3>Account created!</h3>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        {siteSpecific(
                            <img className="img-fluid mx-auto mt-3 mb-4" src="/assets/common/icons/tick.svg" alt="" id="registration-complete-tick" />,
                            <img className="img-fluid mx-auto my-5" src="/assets/cs/decor/verify_done.svg" alt="" />
                        )}
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={12} sm={6} lg={3}>
                        {siteSpecific(
                            <Button className={"my-2"} color="primary" onClick={returnToHomepage}>Home</Button>,
                            <Button className={"my-2"} outline color="secondary" onClick={myAccount}>Your account</Button>
                        )}
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Button className={"my-2"} onClick={continueToPreferences}>{siteSpecific("Preferences", "Continue")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
