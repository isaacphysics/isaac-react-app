import React from "react";
import {Button, Card, CardBody, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE} from "../../services";
import { useNavigate } from "react-router";


export const RegistrationRoleSelect = () => {
    const navigate = useNavigate();

    const teacherSignUp = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/teacher/details");
    };

    const studentSignup = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/register/student/age");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        <Card className="my-7">
            <CardBody>
                <h2>Are you a student or a teacher?</h2>
                <p>Knowing if you are a student or a teacher means we can make sure you have access to the right features.</p>
                <Row>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>Student</h3>
                                </CardTitle>
                                <CardText>
                                    <p>With a student account you can:</p>
                                    <ul>
                                        <li>Set your preferences so that you see content relevant to you</li>
                                        <li>Track your progress, including how many questions you have answered by topic</li>
                                        <li>See all assignments set by your teacher(s)</li>
                                    </ul>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={studentSignup}>I am a student</Button>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Card className="h-100">
                            <CardBody className="d-flex flex-column">
                                <CardTitle>
                                    <h3>Teacher</h3>
                                </CardTitle>
                                <CardText>
                                    <p>With a teacher account you can:</p>
                                    <ul>
                                        <li>Create groups and invite students to join them</li>
                                        <li>Create quizzes from the questions available, and assign them to your groups</li>
                                        <li>View the progress of the students in your groups</li>
                                    </ul>
                                    <p>
                                        Teacher accounts do not give you access to the answers. <a href="/support/teacher/general">Learn more</a>
                                    </p>
                                </CardText>
                                <Button block className="align-self-end mt-auto" onClick={teacherSignUp}>I am a teacher</Button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
