import React from "react";
import {Tabs} from "./Tabs";
import {Button, Card, CardBody, CardText, CardTitle, Col, Row} from "reactstrap";
import {Link} from "react-router-dom";

// FIXME ADA needs a complete rewrite by Ada content team
export const WhySignUpTabs = () => (
    <Tabs tabTitleClass="px-3 py-1" tabContentClass="pt-5">
        {{
            Student: <Row className="signtab-row">
                <Col className="signtab-image">
                    <img src="/assets/NCCE_SW_019.jpg" alt="Students illustration"/>
                </Col>
                <Col className="signtab-info ml-auto">
                    <Card className="card-list py-3 px-4">
                        <CardBody className="d-flex flex-column">
                            <CardTitle tag="h3" className="mb-auto">
                                Benefits for students
                            </CardTitle>
                            <CardText className="mb-auto" tag="div">
                                <strong>Isaac Computer Science allows you to:</strong>
                                <ul>
                                    <li>Study and revise at your own pace</li>
                                    <li>Track your progress as you answer questions</li>
                                    <li>Work towards achieving better exam results</li>
                                    <li>Access high-quality materials written by experienced teachers</li>
                                    <li>Learn relevant content tailored to your exam board</li>
                                </ul>
                                <p>
                                    Everything on Isaac Computer Science is free, funded by the Department for Education.
                                </p>
                            </CardText>
                            <CardText className="mb-auto text-center">
                                <Button tag={Link} to="/register" color="secondary">Sign Up</Button>
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>,
            Teacher: <Row className="signtab-row">
                <Col className="signtab-image">
                    <img src="/assets/NCCE_SW_015.jpg" alt="Teachers instructing"/>
                </Col>
                <Col className="signtab-info ml-auto">
                    <Card className="card-list py-3 px-4">
                        <CardBody className="d-flex flex-column">
                            <CardTitle tag="h3" className="mb-auto">
                                Benefits for teachers
                            </CardTitle>
                            <CardText className="mb-auto" tag="div">
                                <strong>Isaac Computer Science allows you to:</strong>
                                <ul>
                                    <li>Select and set self-marking homework questions</li>
                                    <li>Save time on marking</li>
                                    <li>Pinpoint weak areas to work on with your students</li>
                                    <li>Manage students’ progress in your personal markbook</li>
                                </ul>

                                <strong>Isaac Computer Science aims to provide:</strong>
                                <ul>
                                    <li>Complete coverage of the leading exam specifications</li>
                                    <li>High-quality materials written by experienced teachers</li>
                                </ul>

                                <p>
                                    Everything on Isaac Computer Science is free, funded by the Department for Education.
                                </p>
                            </CardText>
                            <CardText className="text-center">
                                <Button tag={Link} to="/teachers" color="secondary">Teacher Account Page</Button>
                            </CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>,
        }}
    </Tabs>
);
