import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {WarningBanner} from "../../navigation/WarningBanner";

export const HomepagePhy = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const user = useSelector(selectors.user.orNull);

    return <div id="homepage" className="pb-5">
        <WarningBanner/>
        <section id="call-to-action" className="homepageHero">
            <Container className="pt-4">
                <Row className="mt-3">
                    <Col className="d-none d-md-flex mb-1" lg={9}>
                        <span className="physics-strapline">
                            <strong>Master Physics by Solving Problems:</strong><br />
                            <span className="d-none d-md-inline">from School to University!</span>
                        </span>
                    </Col>
                    <Col lg={3} className="align-self-center">
                        {!(user && user.loggedIn) && <Row>
                            <Col className="text-center">
                                <Button size="sm" tag={Link} to="/login" color="primary" outline block>
                                    Log in
                                </Button>
                            </Col>
                            <Col className="text-center">
                                <Button size="sm" tag={Link} to="/register" color="secondary" block>
                                    Sign up
                                </Button>
                            </Col>
                        </Row>}
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col lg="5" className="physics-site-intro">
                        <p>
                            Welcome to Isaac Physics, the free platform for teachers and students.
                        </p>
                        <ul>
                            <li>Use it in the <strong>classroom</strong></li>
                            <li>Use it for <strong>homework</strong></li>
                            <li>Use it for <strong>revision</strong></li>
                        </ul>
                    </Col>
                    <Col lg="7" className="pb-4 pb-lg-0 px-lg-4 align-self-center text-center">
                        <iframe
                            title="Isaac Physics introduction video" width="600" height="280" className="mw-100"
                            src="https://www.youtube-nocookie.com/embed/nW4J-NVDziw?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                            frameBorder="0" allowFullScreen
                        />
                    </Col>
                </Row>

                <div className="physics-site-intro">
                    Show me resources for...
                    <Row className="mt-2">
                        <Col><Button block tag={Link} to="/gcse">GCSE</Button></Col>
                        <Col><Button block tag={Link} to="/alevel">A level or equivalent</Button></Col>
                        <Col><Button block tag={Link} to="/teacher_features">teachers</Button></Col>
                    </Row>
                </div>
            </Container>
        </section>

        <section id="news">
            <Container>
                <h2 className="h-title mt-5 mb-4">News and features</h2>
                <Row className="eventList pt-1 pattern-03-reverse">
                    <Col>
                        <NewsCarousel showTitle={true} descending={false} subject="physics" />
                    </Col>
                </Row>
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
