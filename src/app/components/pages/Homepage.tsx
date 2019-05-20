import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardDeck, CardImg, CardText, CardTitle, Col, Row} from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {IsaacTabs} from "../content/IsaacTabs";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: RegisteredUserDTO | null;
}
export const HomepageComponent = ({user}: HomePageProps) => {
    return <div id="homepage">
        <section id="call-to-action">
            <Row>
                <Col lg={6}>
                    <Row>
                        <Col>
                            <h1 className="pb-3">{
                                user ? `Welcome ${user.givenName}!` : "A level Computer Science learning"
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
                            <Button tag={Link} to={user ? "/topics" : "/register"} color="secondary" block>
                                {user ? "Find a topic" : "Sign up"}
                            </Button>
                        </Col>
                        <Col sm={6} className="pt-3">
                            <Button tag={Link} to={user ? "/events" : "/login"} color="primary" outline block>
                                {user ? "Find an event" : "Log in"}
                            </Button>
                        </Col>
                    </Row>
                </Col>
                <Col lg={6} className="align-self-center text-center">
                    <img src="/assets/ics_hero.svg" className="img-fluid mt-5 mt-lg-3" alt="Students illustration"/>
                </Col>
            </Row>
        </section>

        {!user && <hr />}

        {!user && <section id="why-sign-up">
            <h2 className="text-center mt-4 mb-4">Why sign up?</h2>
            <IsaacTabs/>
        </section>}

        <section id="headline-content" className="px-5 py-4">
            <h3>Featured-question</h3>
            <Row className="p-1">
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
                        <img src="/assets/ics_spot.svg" className="img-fluid" alt="Student illustration" />
                    </div>
                </Col>
            </Row>
        </section>

        <section id="events">
            <Row>
                <Col>
                    <h1 className="text-center">Your face-to-face events</h1>
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col md={{size: 6, offset: 3}}>
                    <p className="text-center">
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

        {!user && <section id="sign-up-card" className="px-5">
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
