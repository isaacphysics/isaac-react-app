import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {WhySignUpTabs} from "../elements/WhySignUpTabs";
import {FeaturedContentTabs} from "../elements/FeaturedContentTabs";
import {EventsCarousel} from "../elements/EventsCarousel";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: LoggedInUser | null;
}
export const HomepageComponent = ({user}: HomePageProps) => {
    useEffect( () => {
        document.title = "Isaac Computer Science";
    }, []);
    return <div id="homepage">
        <section id="call-to-action" className="homepageHero">
            <Container>
                <Row>
                    <Col lg="5" className="pb-5 pt-4 py-sm-5">
                        <Row>
                            <Col>
                                <h1>{
                                    user && user.loggedIn ? `Welcome ${user.givenName}!` : "A level Computer Science learning"
                                }</h1>
                                <p>
                                    Welcome to Isaac Computer Science, the free online platform for students and teachers.
                                </p>
                                <ul>
                                    <li>Use it in the <strong>classroom</strong></li>
                                    <li>Use it for <strong>homework</strong></li>
                                    <li>Use it for <strong>revision</strong></li>
                                </ul>
                                <p>
                                    We also offer free <Link to="/events" target="_blank">teacher CPD events</Link> and {" "}
                                    <span className="text-nowrap">
                                        <Link to="/events" target="_blank">student workshops</Link>.
                                    </span> {" "}
                                    Isaac Computer Science is proud to be part of the Department for Education’s {" "}
                                    <span className="text-nowrap">
                                        <a href="https://teachcomputing.org/" target="_blank" rel="noopener noreferrer" >National Centre for Computing Education</a>.
                                    </span>
                                </p>
                            </Col>
                        </Row>
                        <Row>
                            <Col size={6} className="pt-3 text-center">
                                <Button size="lg" tag={Link} to={user && user.loggedIn ? "/topics" : "/register"} color="secondary" block>
                                    {user && user.loggedIn ? "Find a topic" : "Sign up"}
                                </Button>
                            </Col>
                            <Col size={6} className="pt-3 text-center">
                                <Button size="lg" tag={Link} to={user && user.loggedIn ? "/search" : "/login"} color="primary" outline block>
                                    {user && user.loggedIn ? "Search the site" : "Log in"}
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg="7" className="pb-4 p-lg-5 align-self-center text-center">
                        <iframe
                            title="Isaac Computer Science introduction video" width="640" height="345" className="mw-100 pt-lg-4"
                            src="https://www.youtube-nocookie.com/embed/nW4J-NVDziw?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                            frameBorder="0" allowFullScreen
                        />
                    </Col>
                </Row>
            </Container>
        </section>

        {!(user && user.loggedIn) && <Container><hr /></Container>}

        {!(user && user.loggedIn) && <section id="why-sign-up" className="row sign-up-tabs">
            <Container>
                <Col className="pb-5 pt-4 pattern-04">
                    <h2 className="text-center mb-5">Why sign up?</h2>
                    <WhySignUpTabs />
                </Col>
            </Container>
        </section>}

        <section id="headline-content" className="row bg-primary pattern-05">
            <Container>
                <Col className="py-5 pb-md-0">
                    <FeaturedContentTabs />
                </Col>
            </Container>
        </section>

        <section id="events">
            <Container className="pt-4 pb-5">
                <div className="eventList pt-5 pattern-03">
                    <h2 className="h-title text-center mb-4">Your face-to-face events</h2>
                    <p className="pt-4 pb-2 event-description text-center col-md-8 offset-md-2">
                        {"We offer free face-to-face events for students and teachers. Visit our "}
                        <a href="https://isaaccomputerscience.org/events" target="_blank" rel="noopener noreferrer">
                            Events page
                        </a>
                        {" to see what’s happening in your area, and sign up today!"}
                    </p>
                    <EventsCarousel />
                    <Link to="/events">
                        See all Events
                    </Link>
                </div>
            </Container>
        </section>


        {!(user && user.loggedIn) && <section className="row">
            <Container>
                <Col className="py-4 px-5 mb-5 d-flex align-items-center flex-column flex-md-row border border-dark">
                    <h3 className="text-center text-md-left mr-md-4 mr-lg-0 mb-3 mb-md-0">
                        Sign up to track your progress
                    </h3>
                    <Button tag={Link} size="lg" className="ml-md-auto mr-md-3 mr-lg-5 btn-xl" to={"/register"}>
                        Sign up
                    </Button>
                </Col>
            </Container>
        </section>}
    </div>
};

export const Homepage = connect(stateToProps, dispatchToProps)(HomepageComponent);
