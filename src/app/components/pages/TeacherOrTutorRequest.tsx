import React from 'react';
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Row
} from "reactstrap";
import {
    isTeacherOrAbove,
    isTutorOrAbove,
    SITE_TITLE,
    TEACHER_REQUEST_ROUTE
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Link} from "react-router-dom";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";

export const TeacherOrTutorRequest = ({user}: {user: RegisteredUserDTO}) => {
    return <Container id="contact-page" className="pb-7">
        <TitleAndBreadcrumb currentPageTitle="Request Account Upgrade" icon={{type: "icon", icon: "icon-account"}}/>
        <div className="pt-4">
            <Row>
                <Col size={9}>
                    <Card>
                        {isTutorOrAbove(user) && <Row>
                            <Col className="text-center pt-3">
                                <span className="h3">
                                    {isTeacherOrAbove(user) ? "You already have a teacher account" : "You already have a tutor account"}
                                </span>
                                <p className="mt-3">
                                   Go to the <Link to={isTeacherOrAbove(user) ? "/teachers" : "/tutor_features"}>{isTeacherOrAbove(user) ? "Teacher tools" : "Tutor features"} page</Link> to start using your
                                   new account features.
                                </p>
                            </Col>
                        </Row>}
                        <CardBody>
                            <p>
                               Upgrading your {SITE_TITLE} account gives you access to teaching resources, the ability to
                               assign work to groups of students, and more! To continue, please tell us whether you are a teacher or a tutor:
                            </p>
                            <ul>
                                <li>A "teacher" must be directly associated with a school</li>
                                <li>A "tutor" does not have to be associated with a school (private tutors and parents fall under this
                                   category)</li>
                            </ul>
                            <Row className={"my-4"}>
                                <Col className={"text-center"}>
                                    <Button tag={Link} to={TEACHER_REQUEST_ROUTE}>
                                       I am a teacher
                                    </Button>
                                </Col>
                                <Col className={"text-center"}>
                                    <Button tag={Link} to="/tutor_account_request">
                                       I am a tutor
                                    </Button>
                                </Col>
                            </Row>
                            <small className={"text-muted"}>
                               More information about <Link to="/tutor_features">tutor</Link> and <Link to="/teacher_features">teacher</Link> accounts.
                            </small>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    </Container>;
};
