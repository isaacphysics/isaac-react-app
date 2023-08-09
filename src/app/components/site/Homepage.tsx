import React, {useEffect} from "react";
import {useAppSelector, selectors, isaacApi} from "../../state";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../services";
import {WhySignUpTabs} from "../elements/WhySignUpTabs";
import {NewsCarousel} from "../elements/NewsCarousel";
import {FeaturedContentTabs} from "../elements/FeaturedContentTabs";
import {EventsCarousel} from "../elements/EventsCarousel";
import {FeaturedNewsItem} from "../elements/FeaturedNewsItem";
import classNames from "classnames";

interface ShowMeButtonsProps {
    className?: string
}

export const Homepage = () => {
    useEffect( () => {document.title = "Isaac " + SITE_SUBJECT_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const {data: news} = isaacApi.endpoints.getNewsPodList.useQuery({subject: "news", orderDescending: true});

    const featuredNewsItem = (news && user?.loggedIn) ? news[0] : undefined;
    const carouselNewsItems = news ? (user?.loggedIn ? news.slice(1) : news) : [];

    const ShowMeButtons = ({className} : ShowMeButtonsProps) => <Container id="homepageButtons" className={`${className} ${!user?.loggedIn ? "pt-0 px-lg-0" : ""}`}>
        <h3>Show me</h3>
        <Row>
            <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
                <Button size="lg" tag={Link} to={"/topics/gcse"} color="secondary" block>
                    GCSE resources
                </Button>
            </Col>
            <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
                <Button size="lg" tag={Link} to={"/topics/a_level"} color="secondary" block>
                    A Level resources
                </Button>
            </Col>
            <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
                <Button size="lg" tag={Link} to={"/events"} color="secondary" block>
                    Events
                </Button>
            </Col>
        </Row>
    </Container>;

    return <>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="pt-4 z1">
                    {user?.loggedIn ? <>
                            <Row className="pt-4">
                                <Col md="12" lg="5" className={"pt-lg-4"}>
                                    <Container className={"mb-4"}>
                                        <h1 id="homepageName">Welcome {user.givenName}</h1>
                                    </Container>
                                    <ShowMeButtons className={"pt-xl-2"}/>
                                    {/*<img id="homepageHeroImg" className="img-fluid" alt="Three Computer Science students studying with two laptops, one with code on the screen" src="/assets/ics_hero.svg" />*/}
                                </Col>
                                <Col data-testid={"featured-news-item"} md="12" lg="7" className="d-none d-lg-block">
                                    <FeaturedNewsItem item={featuredNewsItem} />
                                </Col>
                            </Row>
                        </>
                        :
                        <Row>
                            <Col lg="5" className="order-first pb-3">
                                <Row>
                                    <Col>
                                        <h1>
                                            Computer science learning
                                        </h1>
                                        <p className="mt-4">
                                            Welcome to Isaac Computer Science, the free online platform for students and
                                            teachers.
                                        </p>
                                        <ul>
                                            <li>Use it in the <strong>classroom</strong></li>
                                            <li>Use it for <strong>homework</strong></li>
                                            <li>Use it for <strong>revision</strong></li>
                                        </ul>

                                        <p className="mr-lg-n1">
                                            {"We also offer free "}
                                            <Link to="/events?types=teacher">teacher CPD events</Link>{" and "}
                                            <Link to="/events?types=student">student workshops</Link>.<br />
                                            {"Isaac Computer Science is proud to be part of the Department for Education's "}
                                            <Link to="/teachcomputing">National Centre for Computing Education</Link>.
                                        </p>
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg="7" className="order-last order-lg-1 px-lg-5 align-self-center text-center pattern-03">
                                <iframe
                                    title="Isaac Computer Science introduction video" width="640" height="345"
                                    className="mw-100 pt-lg-4"
                                    src="https://www.youtube-nocookie.com/embed/ci6_Du_NHZA?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
                                    frameBorder="0" allowFullScreen
                                />
                            </Col>
                            <Col className="order-lg-last pb-5 pb-lg-3">
                                <ShowMeButtons />
                            </Col>
                        </Row>}
                </Container>
            </section>

            {!user?.loggedIn && <Container>
                <hr/>
            </Container>}

            {!user?.loggedIn && <section id="why-sign-up" className="row sign-up-tabs">
                <Container>
                    <Col className="pb-5 pt-4 pattern-04">
                        <h2 className="text-center mb-5">Why sign up?</h2>
                        <WhySignUpTabs/>
                    </Col>
                </Container>
            </section>}

            <section id="news">
                <Container className={classNames("pt-4 pb-5", {"mt-lg-n5 pt-lg-0": user?.loggedIn ?? false})}>
                    <div data-testid={"news-carousel"} className="eventList pt-5 pattern-03-reverse">
                        <h2 className="h-title mb-4">News</h2>
                        {user?.loggedIn && <div className={"d-block d-lg-none mb-4 mb-lg-0"}>
                            <FeaturedNewsItem item={featuredNewsItem} />
                        </div>}
                        <NewsCarousel items={carouselNewsItems} />
                    </div>
                </Container>
            </section>

            <section id="headline-content" className="row bg-primary pattern-05">
                <Container>
                    <Col className="py-5 pb-md-0">
                        <FeaturedContentTabs/>
                    </Col>
                </Container>
            </section>

            <section id="events">
                <Container className="pt-4 pb-5">
                    <div className="eventList pt-5 pattern-03">
                        <h2 className="h-title text-center mb-4">Events</h2>
                        <p className="pt-4 pb-2 event-description text-center col-md-8 offset-md-2">
                            {"We offer free online events for students and teachers. Visit our "}
                            <Link to="/events">
                                Events page
                            </Link>
                            {" to see what’s happening, and sign up today!"}
                        </p>
                        <EventsCarousel/>
                        <Link to="/events">
                            See all Events
                        </Link>
                    </div>
                </Container>
            </section>

            {!user?.loggedIn && <section className="row">
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
    </>;
};
