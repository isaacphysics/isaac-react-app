import React, {useEffect} from "react";
import {useAppSelector, selectors, isaacApi} from "../../../state";
import {Link} from "react-router-dom";
import {Button, CardDeck, Col, Container, Row} from "reactstrap";
import {SITE_TITLE} from "../../../services";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {WarningBanner} from "../../navigation/WarningBanner";
import {AdaHero2x1, AdaHero1x1} from "../../elements/svg/AdaHero";
import {IsaacCardDeck} from "../../content/IsaacCardDeck";
import {NewsCard} from "../../elements/cards/NewsCard";
import {AdaHomepageSearch} from "../../elements/SearchInputs";
import {MetaDescription} from "../../elements/MetaDescription";

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const {data: news} = isaacApi.endpoints.getNewsPodList.useQuery({subject: "news", orderDecending: true});

    return <>
        <WarningBanner/>
        <MetaDescription description={"Ada Computer Science is a free online computer science programme for students and teachers. Learn by using our computer science topics and questions!"}/>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="py-lg-6 pt-3 pb-5 z1 px-lg-6 px-4" fluid>
                    <Row className={"justify-content-center homepage-hero-logged-out"}>
                        <Col lg={6} xl={5} className={"my-auto mw-640"}>
                            <h1 className={"font-size-1-75 font-size-md-2 font-size-xxl-2-5"}>
                                <span className={"text-pink"}>/</span><br/>
                                Welcome to Ada Computer Science, <span className={"font-weight-regular"}>the free online platform for teachers and students around the world.</span>
                            </h1>
                            <p className={"font-size-1 font-size-md-1-25 py-3"}>
                                Developed by the Raspberry Pi Foundation and the University of Cambridge.
                            </p>
                            <Button tag={Link} to={user?.loggedIn ? "/topics" : "/register"} color="dark-primary">{user?.loggedIn ? "Browse topics" : "Get started"}</Button>
                        </Col>
                        <Col xl={2} className={"spacer d-none d-xl-block"}/>
                        <Col lg={6} xl={5} className={"mw-640 mb-1 mb-sm-3 mb-lg-0"}>
                            <AdaHero1x1 className={"d-lg-block d-none"}/>
                            <AdaHero2x1 className={"mt-5 mt-lg-0 d-lg-none d-block"}/>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="benefits-for-teachers-and-students">
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col lg={6} className={"px-5 my-auto my-lg-0"}>
                            <img className={"d-none d-lg-block w-100"} src={"/assets/cs/decor/benefits-for-homepage-3x4.png"} />
                            <img className={"d-lg-none d-block w-100"} src={"/assets/cs/decor/benefits-for-homepage-4x3.png"} />
                        </Col>
                        <Col lg={6} className={"order-first order-lg-last pb-5 pb-md-0"}>
                            <WhySignUpTabs user={user}/>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="what-resources">
                <Container className={"py-lg-6 py-5"}>
                    <h2 className={"mb-5 mb-lg-6"}>What are you looking for?</h2>
                    <IsaacCardDeck doc={{
                        cards: [{
                            title: "GCSE computer science",
                            subtitle: "Our GCSE computer science topics cover the secondary school phase of learning for students aged 14 to 16.",
                            clickUrl: "/topics#gcse",
                            buttonText: "View GCSE resources",
                            imageClassName: "backslash-1"
                        }, {
                            title: "A level computer science",
                            subtitle: "Our A level computer science topics cover the advanced secondary school phase of learning for students aged 16 to 19.",
                            clickUrl: "/topics#a_level",
                            buttonText: "View A level resources",
                            imageClassName: "backslash-2"
                        }]
                    }} className={"homepage-cards"} />
                </Container>
            </section>

            <section id="computer-science-stories">
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col xs={12} md={6} id={"cs-stories-text"}>
                            <h2 className={"mb-4"}>Computer Science Stories</h2>
                            <p className={"mb-4"}>
                                Ada Lovelace was a true pioneer who is a celebrated figure in the history of computer science.
                                Inspiring professionals, passionate educators, and young graduates are shaping the field of computer science today.
                                We share some of their stories.
                            </p>
                            <Button tag={Link} to="/pages/computer_science_stories" color="primary">Discover stories</Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {news && news.length > 0 && <section id="news">
                <Container className={"py-lg-6 py-5"}>
                    <h2 className={"mb-4 mb-lg-5"}>News</h2>
                    <CardDeck data-testid={"news-pod-deck"} className={"justify-content-center"}>
                        {news.slice(0, 4).map(n => <NewsCard newsItem={n} showTitle />)}
                    </CardDeck>
                    <div className={"mt-4 mt-lg-5 w-100 text-center"}>
                        <Button href={"/news"} color={"link"}><h4 className={"mb-0"}>See more news</h4></Button>
                    </div>
                </Container>
            </section>}

            <section id="search">
                <Container className={"py-lg-6 py-5 text-center"}>
                    <h3 className={"text-white mb-4"}>Ready to get started?</h3>
                    <AdaHomepageSearch className={"d-block"} />
                </Container>
            </section>
        </div>
    </>;
};
