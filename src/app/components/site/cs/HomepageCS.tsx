import React, {useEffect} from "react";
import {useAppSelector, selectors, isaacApi} from "../../../state";
import {Link} from "react-router-dom";
import {Button, CardDeck, Col, Container, Row} from "reactstrap";
import {SITE_TITLE} from "../../../services";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {FeaturedNewsItem} from "../../elements/FeaturedNewsItem";
import {WarningBanner} from "../../navigation/WarningBanner";
import {AdaHero} from "../../elements/svg/AdaHero";
import {IsaacCardDeck} from "../../content/IsaacCardDeck";
import {NewsCard} from "../../elements/cards/NewsCard";

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

            <section id="what-resources">
                <Container className={"py-lg-6 py-5"}>
                    <IsaacCardDeck doc={{
                        title: "What resources are you looking for?",
                        cards: [{
                            title: "Secondary Education",
                            subtitle: "Level 1 is normally achieved years 10 and 11 of secondary school. Level 1 " +
                                "qualifications include and can be equivalent to achieving GCSE. Other examples of " +
                                "Level 1 qualifications include: Level 1 functional skills or essential skills.",
                            clickUrl: "/topics/gcse",
                            imageClassName: "backslash-1"
                        }, {
                            title: "Advanced Level",
                            subtitle: "Advanced level qualifications (known as A levels) are subject-based " +
                                "qualifications that can lead to university, further study, training, or work. You can " +
                                "normally study three or more A levels over two years.",
                            clickUrl: "/topics/a_level",
                            imageClassName: "backslash-2"
                        }, {
                            title: "Events",
                            subtitle: "We are firmly committed to safeguarding young people across all of the " +
                                "activities that Isaac Computer Science supports. We believe that no young person or " +
                                "vulnerable adult should ever experience abuse of any kind.",
                            clickUrl: "/events",
                            imageClassName: "backslash-3"
                        }]
                    }} className={"mt-5 mt-lg-6"} />
                </Container>
            </section>

            <section id="computer-science-stories">
                {/*<img id={"fingerprint-cs-stories"} src={"/assets/cs/decor/fingerprint-cs-stories.svg"}/>*/}
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col xs={12} md={6} id={"cs-stories-text"}>
                            <h3 className={"mb-4"}>Computer science stories</h3>
                            <p className={"p-large mb-4"}>
                                Discover our monthly interview series and learn from passionate educators within the
                                Isaac community, and recently-graduated computer scientists who are doing AMAZING
                                things in a huge range of computing-related fields!
                            </p>
                            <Button tag={Link} to="/pages/computer_science_journeys_gallery" color="secondary">Read some stories</Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {news && news.length > 0 && <section id="news">
                <Container className={"py-lg-6 py-5"}>
                    <h3 className={"mb-4 mb-lg-5"}>News</h3>
                    <CardDeck>
                        {news.slice(0, 3).map(n => <NewsCard newsItem={n} showTitle />)}
                    </CardDeck>
                    <div className={"mt-4 mt-lg-5 w-100 text-center"}>
                        {/* FIXME ADA link this to a general news page? Also fix link CSS design */}
                        <a href={"/"}><h3>See more news</h3></a>
                    </div>
                </Container>
            </section>}

            <section id="search">
                <Container className={"py-lg-6 py-5"}>
                    <Row className={"justify-content-center"}>
                        <Col md={8}>
                            <h3 className={"text-white d-inline-block"}>Ready to get started?</h3>
                            {/* FIXME ADA add search bar */}

                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    </>;
};
