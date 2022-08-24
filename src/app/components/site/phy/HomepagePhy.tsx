import React, {useEffect} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
import {WarningBanner} from "../../navigation/WarningBanner";
import {above, useDeviceSize} from "../../../services/device";
import {isaacApi} from "../../../state";

export const HomepagePhy = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const {data: news} = isaacApi.endpoints.getNewsPodList.useQuery({subject: "physics"});
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <div id="homepage" className="pb-5 px-2 px-sm-5 mx-md-5 px-lg-0">
        <WarningBanner/>
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
                            <li>Use it in the <strong>classroom</strong></li>
                            <li>Use it for <strong>homework</strong></li>
                            <li>Use it for <strong>revision</strong></li>
                        </ul>
                    </Col>
                    <Col lg={7} className={above["lg"](deviceSize) ? `align-items-stretch d-flex flex-column` : ""}>
                        {!(user && user.loggedIn) && <Row className="align-self-end mt-2 mt-lg-0 mb-1 mb-lg-0">
                            <Col className="col-6 col-lg-auto pl-lg-0 pr-1 pr-sm-2">
                                <Button size={above['lg'](deviceSize) || deviceSize === "xs" ? "sm" : ""} tag={Link} to="/login" color="primary" outline className="btn-block">
                                    Log in
                                </Button>
                            </Col>
                            <Col className="col-6 col-lg-auto pl-lg-0 pl-1 pl-sm-2">
                                <Button size={above['lg'](deviceSize) || deviceSize === "xs" ? "sm" : ""} tag={Link} to="/register" color="secondary" className="btn-block">
                                    Sign up
                                </Button>
                            </Col>
                        </Row>}
                        <div className={`h-100 pl-lg-4 ${user?.loggedIn ? "pt-1 pt-sm-2 pt-lg-5" : "pt-4 pt-lg-3"}`}>
                            <div className="yt-video-container">
                                <iframe
                                    title="Isaac Physics introduction video"
                                    src="https://www.youtube-nocookie.com/embed/kWA2AISiHXQ?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                                    frameBorder="0" allowFullScreen className="mw-100"
                                />
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="physics-site-intro mt-4 mt-lg-2">
                    <strong>Show me resources for...</strong>
                    <Row className="mt-2">
                        <Col xs={12} lg={3} className="pr-lg-1 py-1">
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
                        <Col xs={12} lg={3} className="pl-lg-1 py-1">
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
                <h2 className="h-title mb-4 mt-4 pt-2 mt-sm-5 pt-sm-0">News and features</h2>
                <Row className="eventList pt-1 pattern-03-reverse">
                    <Col>
                        <NewsCarousel items={news} showTitle className={"mx-sm-n4"} />
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
