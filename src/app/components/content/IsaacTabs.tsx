import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardTitle, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";

export const IsaacTabs = () => {
    const [activeTab, setActiveTab] = useState(1);
    const tabNavLinkClass = "px-3 py-1";
    return <>
        <Nav tabs>
            <NavItem className="px-3">
                <NavLink
                    className={activeTab === 1 ? `${tabNavLinkClass} active` : tabNavLinkClass}
                    onClick={() => setActiveTab(1)}
                >
                    Teacher
                </NavLink>
            </NavItem>
            <NavItem className="px-3">
                <NavLink
                    className={activeTab === 2 ? `${tabNavLinkClass} active` : tabNavLinkClass}
                    onClick={() => setActiveTab(2)}
                >
                    Student
                </NavLink>
            </NavItem>
        </Nav>
        <TabContent activeTab={activeTab} className="pt-4">
            <TabPane tabId={1}>
                <Row>
                    <Col md={{size: 6, offset: 6}}>
                        <Card>
                            <CardBody>
                                <CardTitle tag="h3">
                                    Benefits for teachers
                                </CardTitle>
                                <strong>Isaac Computer Science allows you to:</strong>
                                <ul>
                                    <li>Select and set self-marking homework questions</li>
                                    <li>Save time on marking</li>
                                    <li>Pinpoint weak areas to work on with your students</li>
                                    <li>Manage students’ progress in your personal markbook</li>
                                </ul>

                                <strong>Isaac Computer Science aims to provide:</strong>
                                {/* TODO, once true, replace with "Isaac Computer Science provides:" */}
                                <ul>
                                    <li>Complete coverage of AQA and OCR specifications</li>
                                    <li>High-quality materials written by experienced teachers</li>
                                </ul>

                                <p>
                                    Everything on Isaac Computer Science is free, funded by the DfE.
                                </p>
                                <div className="text-center">
                                    <Button tag={Link} to="/regiser" color="secondary">Sign Up</Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </TabPane>
            <TabPane tabId={2}>
                <Row>
                    <Col md={6}>
                        <Card>
                            <CardBody>
                                <CardTitle tag="h3">
                                    Benefits for students
                                </CardTitle>
                                <strong>Isaac Computer Science allows you to:</strong>
                                <ul>
                                    <li>Study and revise at your own pace</li>
                                    <li>Track your progress as you answer questions</li>
                                    <li>Work towards achieving better exam results</li>
                                    <li>Access high-quality materials written by experienced teachers</li>
                                    <li>Learn relevant content tailored to your A level exam board</li>
                                </ul>
                                <p>
                                    Everything on Isaac Computer Science is free, funded by the DfE.
                                </p>
                                <div className="text-center">
                                    <Button tag={Link} to="/regiser" color="secondary">Sign Up</Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </TabPane>
        </TabContent>
    </>;
};
