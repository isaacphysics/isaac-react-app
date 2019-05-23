import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardDeck, CardImg, CardText, CardTitle, Col, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {IsaacTabs} from "../content/IsaacTabs";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: LoggedInUser | null;
}
export const HomepageComponent = ({user}: HomePageProps) => {
    return <div id="homepage">
        <section id="call-to-action" className="mt-4 mb-5">
            <Row>
                <Col lg={6}>
                    <Row>
                        <Col>
                            <h1 className="pb-3">{
                                user && user.loggedIn ? `Welcome ${user.givenName}!` : "A-level Computer Science Learning"
                            }</h1>
                            <p>
                                Isaac Computer Science is a free online learning platform, funded by the Department for Education:
                            </p>
                            <ul>
                                <li>Use it in the classroom</li>
                                <li>Use it for homework</li>
                                <li>Use it for revision</li>
                            </ul>
                            <p>{
                                "Isaac Computer Science will provide full coverage of every A level " +
                                "Computer Science topic, and a vast bank of self-marking questions — " +
                                "all mapped to the AQA and OCR specifications, and all created by our team of " +
                                "experienced teachers."
                            }</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={6} className="pt-3">
                            <Button tag={Link} to={user && user.loggedIn ? "/topics" : "/register"} color="secondary" block>
                                {user && user.loggedIn ? "Find a topic" : "Sign up"}
                            </Button>
                        </Col>
                        <Col sm={6} className="pt-3">
                            <Button tag={Link} to={user && user.loggedIn ? "/events" : "/login"} color="primary" outline block>
                                {user && user.loggedIn ? "Find an event" : "Log in"}
                            </Button>
                        </Col>
                    </Row>
                </Col>
                <Col lg={6} className="align-self-center text-center">
                    <img src="/assets/ics_hero.svg" className="img-fluid mt-5 mt-lg-3" alt="Students illustration"/>
                </Col>
            </Row>
        </section>

        {!(user && user.loggedIn) && <hr />}

        {!(user && user.loggedIn) && <section id="why-sign-up" className="mb-5">
            <h2 className="text-center mb-4">Why sign up?</h2>
            <IsaacTabs tabNavLinkClass="px-3 py-1">
                {{
                    Teacher: <Row>
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
                    </Row>,
                    Student: <Row>
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
                    </Row>,
                }}
            </IsaacTabs>
        </section>}

        <section id="headline-content" className="px-5 py-5">
            <IsaacTabs tabNavLinkClass="px-3 py-1">
                {{
                    "Featured Question": <Row className="p-1">
                        <Col md={6}>
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
                        <Col md={6}>
                            <div className="text-center">
                                <img src="/assets/ics_spot.svg" className="img-fluid" alt="Student illustration"/>
                            </div>
                        </Col>
                    </Row>
                }}
            </IsaacTabs>
        </section>

        <section id="events" className="pb-5">
            <Row>
                <Col>
                    <h1 className="h-title text-center my-4">Your face-to-face events</h1>
                </Col>
            </Row>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <p className="text-center mb-5">
                        {"We offer free face-to-face events for students and teachers. Visit our "}
                        <Link to="/events">events page</Link>
                        {" to see what’s happening in your area, and sign up today!"}
                    </p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <CardDeck>
                        <Card>
                            <div className="text-center">
                                <CardImg top src="/assets/event-1.png" alt="Teacher event illustration" />
                            </div>
                            <CardBody>
                                <CardTitle className="font-weight-bold">Teacher Workshop</CardTitle>
                                <CardText>Embedding isaaccomputerscience in your teaching</CardText>
                                <CardText>
                                    <span className="d-block">
                                        <span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019
                                    </span>
                                    <span className="d-block">
                                        12:00 PM — 4:00 PM
                                    </span>
                                    <span className="d-block">
                                        <span className="font-weight-bold">Location:</span> {" "} NUSTEM, Northumbria
                                    </span>
                                </CardText>
                                <CardText><Link to="event/event1">View Details</Link></CardText>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <CardImg top src="/assets/event-2.png" alt="CPD event illustration" />
                            </div>
                            <CardBody>
                                <CardTitle className="font-weight-bold">Virtual teacher CPD</CardTitle>
                                <CardText>Introduction to teaching with isaaccomputerscience.org</CardText>
                                <CardText>
                                    <span className="d-block">
                                        <span className="font-weight-bold">When:</span> {" "} Wed 3 Apr 2019
                                    </span>
                                    <span className="d-block">
                                        12:00 PM — 13:00 PM
                                    </span>
                                    <span className="d-block">
                                        <span className="font-weight-bold">Location:</span> {" "} Online
                                    </span>
                                </CardText>
                                <CardText><Link to="event/event1">View Details</Link></CardText>
                            </CardBody>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <CardImg top src="/assets/event-3.png" alt="Teacher event illustration" />
                            </div>
                            <CardBody>
                                <CardTitle className="font-weight-bold">Student Workshop</CardTitle>
                                <CardText>Problem Solving with Vectors</CardText>
                                <CardText>
                                    <span className="d-block">
                                        <span className="font-weight-bold">When:</span> {" "} Wed 27 Mar 2019
                                    </span>
                                    <span className="d-block">
                                        5:30 PM — 7:30 PM
                                    </span>
                                    <span className="d-block">
                                        <span className="font-weight-bold">Location:</span> {" "} Abbey College, Cambridge
                                    </span>
                                </CardText>
                                <CardText><Link to="event/event1">View Details</Link></CardText>
                            </CardBody>
                        </Card>
                    </CardDeck>
                </Col>
            </Row>
        </section>

        {!(user && user.loggedIn) && <section id="sign-up-card" className="px-5 mb-5">
            <Row>
                <Col lg={7} className="text-center text-lg-right">
                    <h3 className="align-content-center">
                        Sign up to track your progress
                    </h3>
                </Col>
                <Col lg={3} className="text-center">
                    <Button color="secondary" tag={Link} to="/register" size="lg" className="align-content-center">
                        Sign Up
                    </Button>
                </Col>
            </Row>
        </section>}
    </div>
};

export const Homepage = connect(stateToProps, dispatchToProps)(HomepageComponent);
