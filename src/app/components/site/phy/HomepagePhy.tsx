import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";

export const HomepagePhy = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const user = useSelector(selectors.user.orNull);

    return <div id="homepage" className="pb-5">
        <section id="call-to-action" className="homepageHero">
            <Container className="pt-4">
                <Row className="mt-3">
                    <Col className="d-none d-md-flex mb-1" lg={9}>
                        <span className="physics-strapline">Mastering Physics by Solving Problems<span className="d-none d-md-inline">: from School to University!</span></span>
                    </Col>
                </Row>
                <Row className="pt-3">
                    <Col lg="5">
                        <Row>
                            <Col>
                                <p>
                                    Welcome to Isaac Physics, the free platform for students and teachers.
                                </p>
                                <ul>
                                    <li>Use it in the <strong>classroom</strong></li>
                                    <li>Use it for <strong>homework</strong></li>
                                    <li>Use it for <strong>revision</strong></li>
                                </ul>
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
                    <Col lg={{size: 5, offset: 1}} className="pt-4 pt-md-0">
                        <Row>
                            Show me resources for:
                        </Row>
                        <Row>
                            <Col md={{ size: 10, offset: 0 }}>
                                <Row className="p-2">
                                    <Button size="md" tag={Link} to="/gcse" color="primary" block className="text-left">
                                        ... GCSE
                                    </Button>
                                </Row>
                                <Row className="p-2">
                                    <Button size="md" tag={Link} to="/alevel" color="primary" block className="text-left">
                                        ... A level<span className="d-none d-md-inline"> or equivalent</span>
                                    </Button>
                                </Row>
                                <Row className="p-2">
                                    <Button size="md" tag={Link} to="/teacher_features" color="primary" block className="text-left">
                                        ... Teachers
                                    </Button>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>





            </Container>
        </section>

        <section id="news">
            <Container className="pt-4 pb-5">
                <div className="eventList pt-5 pattern-03-reverse">
                    <h2 className="h-title mb-4">News</h2>
                    <NewsCarousel showTitle={true} descending={true} subject="physics" />
                </div>
            </Container>
        </section>

        {!(user && user.loggedIn) && <section className="row">
            <Container>
                <Col className="mt-4 py-4 px-5 d-flex align-items-center flex-column flex-md-row border bg-white">
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
