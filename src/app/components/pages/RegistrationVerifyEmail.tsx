import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import classNames from "classnames";
import {selectors, useAppSelector} from "../../state";


export const RegistrationVerifyEmail = () => {
    // todo: repeatedly check for verification status for current user
    // todo: redirect away if either not logged in at all or fully logged-in

    const [emailVerified, setEmailVerified] = useState(true);
    const user = useAppSelector(selectors.user.orNull);

    useEffect(() => {
        console.log(user);
    }, [user])

    return <Container className="text-center">
        <Card className="my-5">
            <CardBody>
                <Row className="justify-content-center">
                    <Col>
                        <h3>Verify your teacher account</h3>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        <p>Check your email for a link to verify your account.</p>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col className={classNames({"d-none": emailVerified})}>
                        <img className="img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_request.svg"} alt="" />
                    </Col>
                    <Col className={classNames({"d-none": !emailVerified})}>
                        <img className="img-fluid mx-auto my-5" src={"/assets/cs/decor/verify_done.svg"} alt="" />
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col>
                        <a>Resend verification email</a>
                    </Col>
                </Row>
                <Row className={classNames({"d-none": !emailVerified}, "justify-content-center")}>
                    <Col xs={3}>
                        <Button outline color="secondary">My Account</Button>
                    </Col>
                    <Col xs={3}>
                        <Button>Continue</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}