import React from "react";
import {Button, Card, CardBody, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {isAda, SITE_TITLE} from "../../services";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";

export const RegistrationRoleSelect = () => {
    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <h2>Are you a student or a teacher?</h2>
                <p>Knowing if you are a student or a teacher means we can make sure you have access to the right features.</p>
                <Row>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody>
                                <CardTitle>
                                    <h3>Student</h3>
                                </CardTitle>
                                <p>With a student account you can:</p>
                                <ul>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                </ul>
                                {/* todo: this button should be at the bottom of the card */}
                                <Button block disabled>I am a student</Button>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody>
                                <CardTitle>
                                    <h3>Teacher</h3>
                                </CardTitle>
                                <p>With a teacher account you can:</p>
                                <ul>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                    <li>Lorem ipsum dolor sit amet consectetur.</li>
                                </ul>
                                <p>
                                    Teacher accounts do not give you access to the answers. <a href="/support/teacher/general">Learn more</a>
                                </p>
                                <Button block href="/register/teacher/details">I am a teacher</Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}