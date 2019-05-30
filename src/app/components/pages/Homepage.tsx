import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardDeck, CardImg, CardText, CardTitle, Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {WhySignUpTabs} from "../elements/WhySignUpTabs";
import {FeaturedContentTabs} from "../elements/FeaturedContentTabs";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: LoggedInUser | null;
}
export const HomepageComponent = ({user}: HomePageProps) => {
    return <div id="homepage">
        <section id="call-to-action" className="homepageHero">
            <Container>
                <Row>
                    <Col lg="5" className="py-5">
                        <Row>
                            <Col>
                                <h1>{
                                    user && user.loggedIn ? `Welcome ${user.givenName}!` : "A level Computer Science learning"
                                }</h1>
                                <p>
                                    Isaac Computer Science is a free online learning platform, funded by the Department for Education:
                                </p>
                                <ul>
                                    <li>Use it in the <strong>classroom</strong></li>
                                    <li>Use it for <strong>homework</strong></li>
                                    <li>Use it for <strong>revision</strong></li>
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
                            <Col size={6} className="pt-3 text-center">
                                <Button size="lg" tag={Link} to={user && user.loggedIn ? "/topics" : "/register"} color="secondary" block>
                                    {user && user.loggedIn ? "Find a topic" : "Sign up"}
                                </Button>
                            </Col>
                            <Col size={6} className="pt-3 text-center">
                                <Button size="lg" tag={Link} to={user && user.loggedIn ? "/events" : "/login"} color="primary" outline block>
                                    {user && user.loggedIn ? "Find an event" : "Log in"}
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg="7" className="p-sm-5 align-self-center text-center">
                        <img src="/assets/ics_hero.svg" className="img-fluid" alt="Students illustration"/>
                    </Col>
                </Row>
            </Container>
        </section>

        {!(user && user.loggedIn) && <Container><hr /></Container>}

        {!(user && user.loggedIn) && <section id="why-sign-up" className="row sign-up-tabs">
            <Container>
                <Col className="py-5 pattern-04">
                    <h2 className="text-center mb-3">Why sign up?</h2>
                    <WhySignUpTabs />
                </Col>
            </Container>
        </section>}

        <section id="headline-content" className="row bg-primary pattern-05">
            <Container>
                <Col className="py-5">
                    <FeaturedContentTabs />
                </Col>
            </Container>
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
