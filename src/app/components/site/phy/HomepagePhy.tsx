import React, {useEffect} from "react";
import {selectors, useAppSelector, useGetNewsPodListQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {above, SITE_TITLE, useDeviceSize, useUserConsent} from "../../../services";
import {WarningBanner} from "../../navigation/WarningBanner";
import { HomepageYoutubeCookieHandler } from "../../handlers/InterstitialCookieHandler";

export const HomepagePhy = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const {data: news} = useGetNewsPodListQuery({subject: "physics"});
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();
    const userConsent = useUserConsent();

    return <>
        {/*<WarningBanner/>*/}
        <div id="homepage" className="pb-5 px-2 px-sm-5 mx-md-5 px-lg-0">
            <section id="call-to-action" className="homepageHero">
                <Container className="pt-4">
                    <Row className="mt-sm-4">
                        <Col lg={5} className="physics-site-intro">
                            <h1 className={`physics-strapline ${above["lg"](deviceSize) ? "h2" : ""} mb-lg-3`}>
                                {above["sm"](deviceSize) ?
                                    <>Master Physics by Solving Problems:<br /><small>from School to University!</small></> :
                                    <>Master Physics by Solving Problems</>}
                            </h1>
                            <p>Welcome to Isaac Physics, the free platform for teachers and students.</p>
                            <ul>
                                <li>Use it in <strong>space</strong></li>
                                <li>Use it on <strong>land</strong></li>
                                <li>Use it <strong>underwater</strong></li>
                            </ul>
                        </Col>
                        <Col lg={7} className={above["lg"](deviceSize) ? `align-items-stretch d-flex flex-column` : ""}>
                            {!(user && user.loggedIn) && <Row className="align-self-end mt-2 mt-lg-0 mb-1 mb-lg-0">
                                <Col className="col-6 col-lg-auto ps-lg-0 pe-1 pe-sm-2">
                                    <Button size={above['lg'](deviceSize) || deviceSize === "xs" ? "sm" : ""} tag={Link} to="/login" color="primary" outline className="btn-block">
                                        Log in
                                    </Button>
                                </Col>
                                <Col className="col-6 col-lg-auto ps-lg-0 ps-1 ps-sm-2">
                                    <Button size={above['lg'](deviceSize) || deviceSize === "xs" ? "sm" : ""} tag={Link} to="/register" color="secondary" className="btn-block">
                                        Sign up
                                    </Button>
                                </Col>
                            </Row>}
                            <div className={`h-100 ps-lg-4 content-video-container w-100 ${user?.loggedIn ? "pt-1 pt-sm-2 pt-lg-2" : "pt-4 pt-lg-3"} ${userConsent.cookieConsent?.youtubeCookieAccepted ?? false ? "ratio-16x9" : ""}`}>
                                <HomepageYoutubeCookieHandler />
                            </div>
                        </Col>
                    </Row>

                    <div className="physics-site-intro mt-4 mt-lg-2">
                        <strong>Show me resources for...</strong>
                        <Row className="mt-2">
                            <Col xs={12} lg={3} className="pe-lg-1 py-1">
                                <Button size={deviceSize==="xs" ? "sm" : ""} block tag={Link} to="/11_14" className="h-100 d-inline-flex align-items-center justify-content-center">
                                    11-14
                                </Button>
                            </Col>
                            <Col xs={12} lg={3} className="px-lg-1 py-1">
                                <Button size={deviceSize==="xs" ? "sm" : ""} block tag={Link} to="/gcse" className="h-100 d-inline-flex align-items-center justify-content-center">
                                    {above["md"](deviceSize) ?
                                        "GCSE or\u00A0equivalent" :
                                        "GCSE"}
                                </Button>
                            </Col>
                            <Col xs={12} lg={3} className="px-lg-1 py-1">
                                <Button size={deviceSize==="xs" ? "sm" : ""} block tag={Link} to="/alevel" className="h-100 d-inline-flex align-items-center justify-content-center">
                                    {above["md"](deviceSize) ?
                                        "A\u00A0Level or\u00A0equivalent" :
                                        "A\u00A0Level"}
                                </Button>
                            </Col>
                            <Col xs={12} lg={3} className="ps-lg-1 py-1">
                                <Button size={deviceSize==="xs" ? "sm" : ""} block tag={Link} to="/teacher_features" className="h-100 d-inline-flex align-items-center justify-content-center">
                                    teachers
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            <section id="news">
                <Container>
                    <div className="h-underline mb-4 mt-4 pt-2 mt-sm-5 pt-sm-0 d-flex align-items-center">
                        <h2>News and features</h2>
                        <Link to="/news" className="ms-auto">See all news</Link>
                    </div>
                    <Row className="eventList pt-1">
                        <Col>
                            <NewsCarousel items={news} showTitle className={"mx-sm-n4"} />
                        </Col>
                    </Row>
                </Container>
            </section>

            {!user?.loggedIn && <section className="mb-4">
                <Container>
                    <div className="mt-4 py-4 px-5 d-flex align-items-center flex-column flex-md-row border bg-white">
                        <h3 className="text-center text-md-start me-md-4 me-lg-0 mb-3 mb-md-0">
                            Sign up to track your progress
                        </h3>
                        <Button tag={Link} size="lg" className="ms-md-auto me-md-3 me-lg-5 btn-xl" to={"/register"}>
                            Sign up
                        </Button>
                    </div>
                </Container>
            </section>}
        </div>
    </>;
};
