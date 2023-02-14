import React, {useEffect} from "react";
import {useAppSelector, selectors, isaacApi} from "../../../state";
import {Link} from "react-router-dom";
import {Badge, Button, Col, Container, Row} from "reactstrap";
import {SITE_TITLE} from "../../../services";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {FeaturedContentTabs} from "../../elements/FeaturedContentTabs";
import {EventsCarousel} from "../../elements/EventsCarousel";
import {FeaturedNewsItem} from "../../elements/FeaturedNewsItem";
import classNames from "classnames";
import {WarningBanner} from "../../navigation/WarningBanner";
import {AdaHero} from "../../elements/svg/AdaHero";

interface ShowMeButtonsProps {
    className?: string
}

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const {data: news} = isaacApi.endpoints.getNewsPodList.useQuery({subject: "news", orderDecending: true});

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
        <WarningBanner/>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="py-lg-6 pt-3 pb-5 z1">
                    {user?.loggedIn ? <>
                            {/* FIXME ADA logged in hero view still needs updating... */}
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
                        : <Row>
                            <Col md={6} className={"mt-auto"}>
                                <h1 className={"h-l"}>
                                    <span className={"text-pink"}>/</span><br/>
                                    Computer science learning,<span className={"h-thin"}> it's more than just the machine.</span>
                                </h1>
                                <p className={"p-large pt-2"}>
                                    Welcome to Ada Computer Science, the free online platform for students and teachers.
                                </p>
                                <Button tag={Link} to="/register" color="secondary">Sign Up</Button>
                            </Col>
                            <Col md={6} className={"order-first order-md-last"}>
                                <AdaHero/>
                            </Col>
                        </Row>
                    }
                </Container>
            </section>

            <section id="benefits-for-teachers-and-students">
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col md={6} className={"px-5 my-auto my-lg-0"}>
                            <img className={"w-100"} src={"/assets/cs/decor/benefits-for-teachers-hero.png"} />
                        </Col>
                        <Col md={6} className={"order-first order-md-last pb-5 pb-md-0"}>
                            <WhySignUpTabs/>
                        </Col>
                    </Row>
                </Container>
            </section>

            {!user?.loggedIn && <Container>
                <hr/>
            </Container>}

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
