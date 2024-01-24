import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {history} from "../../services";


export const RegistrationSuccess = () => {
    const myAccount = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/account");
    };

    const continueToPreferences = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register/preferences");
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
                        <img className="img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_done.svg"} alt="" />
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col xs={12} sm={6} lg={3}>
                        <Button className={"my-2"} outline color="secondary" onClick={myAccount}>Your account</Button>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Button className={"my-2"} onClick={continueToPreferences}>Continue</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}