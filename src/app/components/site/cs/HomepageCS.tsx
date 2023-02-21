import React, {useEffect} from "react";
import {useAppSelector, selectors, isaacApi} from "../../../state";
import {Link} from "react-router-dom";
import {Button, CardDeck, Col, Container, Row} from "reactstrap";
import {SITE_TITLE} from "../../../services";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {FeaturedNewsItem} from "../../elements/FeaturedNewsItem";
import {WarningBanner} from "../../navigation/WarningBanner";
import {AdaHero2x1, AdaHero1x1} from "../../elements/svg/AdaHero";
import {IsaacCardDeck} from "../../content/IsaacCardDeck";
import {NewsCard} from "../../elements/cards/NewsCard";
import {AdaHomepageSearch} from "../../elements/SearchInputs";

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
                        : <Row className={"justify-content-center homepage-hero-logged-out"}>
                            <Col lg={6} className={"my-auto pr-xl-5"}>
                                <div className={"mw-640"}>
                                    <h1 className={"font-h1-l"}>
                                        <span className={"text-pink"}>/</span><br/>
                                        The global computer science platform <span className={"font-h1-thin"}>for students and teachers.</span>
                                    </h1>
                                    <p className={"p-large pt-2"}>
                                        Developed by the Raspberry Pi Foundation and the University of Cambridge.
                                    </p>
                                    <Button tag={Link} to="/register" color="dark-primary">Get Started</Button>
                                </div>
                            </Col>
                            <Col lg={6} className={"pl-xl-5"}>
                                <div className={"mw-640"}>
                                    <AdaHero1x1 className={"d-lg-block d-none"}/>
                                    <AdaHero2x1 className={"mt-5 mt-lg-0 d-lg-none d-block"}/>
                                </div>
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
                        title: "What are you looking for?",
                        cards: [{
                            title: "GCSE computer science",
                            subtitle: "Our GCSE computer science topics cover the secondary school phase of learning for students aged 14 to 16.",
                            clickUrl: "/topics/gcse",
                            buttonText: "View GCSE resources",
                            imageClassName: "backslash-1"
                        }, {
                            title: "A level computer science",
                            subtitle: "Our A level computer science topics cover the advanced secondary school phase of learning for students aged 16 to 18.",
                            clickUrl: "/topics/a_level",
                            buttonText: "View A level resources",
                            imageClassName: "backslash-2"
                        }]
                    }} className={"mt-5 mt-lg-6"} />
                </Container>
            </section>

            <section id="computer-science-stories">
                {/*<img id={"fingerprint-cs-stories"} src={"/assets/cs/decor/fingerprint-cs-stories.svg"}/>*/}
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col xs={12} md={6} id={"cs-stories-text"}>
                            <h3 className={"mb-4"}>Computer Science in context</h3>
                            <p className={"p-large mb-4"}>
                                Ada Lovelace was a true pioneer who is a celebrated figure in the history of computer science.
                                Inspiring professionals, passionate educators, and young graduates are shaping the field of computer science today.
                                We share some of their stories.
                            </p>
                            <Button tag={Link} to="/pages/computer_science_journeys_gallery" color="primary">Discover stories</Button>
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
                        <Col md={2} className={"my-auto"}>
                            <h3 className={"text-white d-inline-block"}>Ready to get started?</h3>
                        </Col>
                        <Col md={7} className={"my-auto"}>
                            <AdaHomepageSearch className={"d-inline-block long-search-bar"} />
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    </>;
};
