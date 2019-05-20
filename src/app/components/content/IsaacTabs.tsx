import React, {useState} from "react";
import {Card, CardBody, CardTitle, Col, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";

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
                                <CardTitle tag="h2">
                                    Benefits for{" "}<span className="text-secondary">teachers</span>
                                </CardTitle>
                                <ul>
                                    <li>Easy to set homework</li>
                                    <li>Easy to check homework</li>
                                    <li>See progress</li>
                                    <li>Managing different classes</li>
                                    <li>Increase in pass rate</li>
                                    <li>Syllabus information</li>
                                    <li>Teachers Events</li>
                                </ul>
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
                                <CardTitle tag="h2">
                                    Benefits for{" "}<span className="text-secondary">students</span>
                                </CardTitle>
                                <ul>
                                    <li>Easy to set homework</li>
                                    <li>Easy to check homework</li>
                                    <li>See progress</li>
                                    <li>Managing different classes</li>
                                    <li>Increase in pass rate</li>
                                    <li>Syllabus information</li>
                                    <li>Student Events</li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </TabPane>
        </TabContent>
    </>;
};
