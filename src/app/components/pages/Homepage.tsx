import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardImg, CardText, CardTitle, Col, Row} from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: RegisteredUserDTO | null
}
export const HomePageComponent = ({user}: HomePageProps) => {
    return <div id="homepage">
        <section id="call-to-action">
            <Row>
                <Col size={12} md={6}>
                    <Row>
                        <Col>
                            <h1>A-level Computer Science Learning</h1>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla feugiat lorem nisl, sed
                                convallis dui lobortis volutpat.
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col size={6}>
                            <Button tag={Link} to="/register" color="primary" block>Sign up</Button>
                        </Col>
                        <Col size={6}>
                            <Button tag={Link} to="/login" color="dark" outline block>Log in</Button>
                        </Col>
                    </Row>
                </Col>
                <Col size={12} md={6}>
                    <img src="/assets/ics_hero.svg" className="img-fluid" alt="Students illustration" />
                </Col>
            </Row>
        </section>

        <hr />

        <section id="why-sign-up">
            <h1 className="text-center">Why sign up?</h1>

            <Row>
                <Col size={12} md={6}>
                    <Card>
                        <CardBody>
                            <CardTitle tag="h2">
                                Benefits for{" "}<span className="text-primary">teachers</span>
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
                <Col size={12} md={6}>
                    <Card>
                        <CardBody>
                            <CardTitle tag="h2">
                                Benefits for{" "}<span className="text-primary">students</span>
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
        </section>

        <section id="headline-content" className="px-5 py-4">
            <h3>Featured-question</h3>
            <Row className="p-1">
                <Col size={12} md={6}>
                    <p className="font-weight-bold">
                        Trace the pseudocode and enter the output that will be produced when the program is run
                    </p>
                    <pre className="text-monospace">
                        {
                            "SUBROUTINE increase_num()\n" +
                            "    num2 ← 2\n" +
                            "    num1 ← num2 + 5\n" +
                            "    num2 ← 13\n" +
                            "ENDSUBROUTINE\n\n" +
                            "num1 ← 4\n" +
                            "num2 ← 10\n\n" +
                            "increase_num()\n\n" +
                            "num3 ← 4\n\n" +
                            "OUTPUT num1 + num2 + num3"
                        }
                    </pre>
                </Col>
                <Col size={12} md={6}>
                    <div className="text-center">
                        <img src="/assets/ics_spot.svg" className="img-fluid" alt="Student illustration" />
                    </div>
                </Col>
            </Row>
        </section>

        <section id="events">
            <Row>
                <Col size={12}>
                    <h1 className="text-center">We run events</h1>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col size={12} md={{size: 6, offset: 3}}>
                    <p className="text-center">
                        We have a number of events throughout the year. Below you can see a snapshot of some of the
                        events we run. On our events page you will see more, and see how you can sign up for more
                        information or sign up to events themselves.
                    </p>
                </Col>
            </Row>
            <Row>
                <Col size={12} md={4}>
                    <Card>
                        <div className="text-center">
                            <CardImg top src="assets/event-1.png" alt="Teacher event illustration" />
                        </div>
                        <CardBody>
                            <CardTitle className="font-weight-bold">Teacher Workshop</CardTitle>
                            <CardText>Embedding isaaccomputerscience in your teaching</CardText>
                            <CardText>
                                <div><span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019</div>
                                <div>12:00 PM — 4:00 PM</div>
                                <div><span className="font-weight-bold">Location:</span> {" "} NUSTEM, Northumbria</div>
                            </CardText>
                            <CardText><Link to="event/event1">View Details</Link></CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col size={12} md={4}>
                    <Card>
                        <div className="text-center">
                            <CardImg top src="assets/event-2.png" alt="CPD event illustration" />
                        </div>
                        <CardBody>
                            <CardTitle className="font-weight-bold">Virtual teacher CPD</CardTitle>
                            <CardText>Introduction to teaching with isaaccomputerscience.org</CardText>
                            <CardText>
                                <div><span className="font-weight-bold">When:</span> {" "} Wed 3 Apr 2019</div>
                                <div>12:00 PM — 13:00 PM</div>
                                <div><span className="font-weight-bold">Location:</span> {" "} Online</div>
                            </CardText>
                            <CardText><Link to="event/event1">View Details</Link></CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col size={12} md={4}>
                    <Card>
                        <div className="text-center">
                            <CardImg top src="assets/event-3.png" alt="Teacher event illustration" />
                        </div>
                        <CardBody>
                            <CardTitle className="font-weight-bold">Student Workshop</CardTitle>
                            <CardText>Problem Solving with Vectors</CardText>
                            <CardText>
                                <div><span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019</div>
                                <div>5:30 PM — 7:30 PM</div>
                                <div><span className="font-weight-bold">Location:</span> {" "} Abbey College, Cambridge</div>
                            </CardText>
                            <CardText><Link to="event/event1">View Details</Link></CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </section>
    </div>
};

export const Homepage = connect(stateToProps, dispatchToProps)(HomePageComponent);
