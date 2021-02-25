import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {WarningBanner} from "../../navigation/WarningBanner";
import {useDeviceSize} from "../../../services/device";

export const HomepagePhy = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const user = useSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <div id="homepage" className="pb-5 px-2 px-sm-5 mx-md-5 px-lg-0">
        <WarningBanner/>
        <section id="call-to-action" className="homepageHero">
            <Container className="pt-4">
                <Row className="mt-4">
                    <Col lg={5} className="physics-site-intro">
                        <h1 className={`physics-strapline ${["lg", "xl"].includes(deviceSize) ? "h2" : ""} mb-lg-3`}>
                            Master Physics by Solving Problems:<br />
                            <small>from School to University!</small>
                        </h1>
                        <p>
                            Welcome to Isaac Physics, the free platform for teachers and students.
                        </p>
                        <ul>
                            <li>Use it in the <strong>classroom</strong></li>
                            <li>Use it for <strong>homework</strong></li>
                            <li>Use it for <strong>revision</strong></li>
                        </ul>
                    </Col>
                    <Col lg={7} className="align-items-stretch d-flex flex-column">
                        {!(user && user.loggedIn) && <Row className="align-self-end">
                            <Col className="text-center col-auto">
                                <Button size="sm" tag={Link} to="/login" color="primary" outline className="mr-2">
                                    Log in
                                </Button>
                                <Button size="sm" tag={Link} to="/register" color="secondary">
                                    Sign up
                                </Button>
                            </Col>
                        </Row>}
                        <div className={`h-100 pl-lg-4 pt-4 ${user?.loggedIn ? "pt-lg-5" : ""}`}>
                            <div className="yt-video-container">
                                <iframe
                                    title="Isaac Physics introduction video"
                                    src="https://www.youtube-nocookie.com/embed/wd9vdc_yYKM?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                                    frameBorder="0" allowFullScreen className="mw-100"
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="physics-site-intro mt-4">
                    <strong>Show me resources for...</strong>
                    <Row className="mt-2">
                        <Col xs={12} sm={4}>
                            <Button block tag={Link} to="/gcse" className="h-100 d-inline-flex align-items-center justify-content-center">
                                GCSE
                            </Button>
                        </Col>
                        <Col xs={12} sm={4} className="pt-2 pt-sm-0">
                            <Button block tag={Link} to="/alevel" className="h-100 d-inline-flex align-items-center justify-content-center">
                                A level or equivalent
                            </Button>
                        </Col>
                        <Col xs={12} sm={4} className="pt-2 pt-sm-0">
                            <Button block tag={Link} to="/teacher_features" className="h-100 d-inline-flex align-items-center justify-content-center">
                                teachers
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Container>
        </section>

        <section id="news">
            <Container>
                <h2 className="h-title mt-5 mb-4">News and features</h2>
                <Row className="eventList pt-1 pattern-03-reverse">
                    <Col>
                        <NewsCarousel showTitle={true} descending={false} subject="physics" className={`mx-md-n4`} />
                    </Col>
                </Row>
            </Container>
        </section>

        {!(user && user.loggedIn) && <section className="row mb-4">
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
