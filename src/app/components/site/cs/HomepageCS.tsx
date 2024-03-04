import React, {useEffect} from "react";
import {selectors, useAppSelector, useGetNewsPodListQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, CardDeck, Col, Container, Row} from "reactstrap";
import {isLoggedIn, SITE_TITLE} from "../../../services";
import {WhySignUpTabs} from "../../elements/WhySignUpTabs";
import {AdaHero2x1} from "../../elements/svg/AdaHero";
import {FeaturedNewsItem} from "../../elements/FeaturedNewsItem";
import {IsaacCardDeck} from "../../content/IsaacCardDeck";
import {NewsCard} from "../../elements/cards/NewsCard";
import {AdaHomepageSearch} from "../../elements/SearchInputs";
import {MetaDescription} from "../../elements/MetaDescription";

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const {data: news} = useGetNewsPodListQuery({subject: "news"});
    const featuredNewsItem = (news && user?.loggedIn) ? news[0] : undefined;

    return <>
        {/*<WarningBanner/>*/}
        <MetaDescription description={"Ada Computer Science is a free online computer science programme for students and teachers. Learn by using our computer science topics and questions!"}/>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="py-5 px-md-4 px-xxl-5 mw-1600" fluid>
                    <Row className={"justify-content-center"}>
                        <Col xs={12} lg={7} className={"my-auto"}>
                            <h1 className={"font-size-1-75"}>
                                <span className={"text-pink"}>/</span><br/>
                                Computer science education should be accessible for everyone
                            </h1>
                            <p className={"font-size-1 font-size-md-1-25 py-3"}>
                                We create free resources to help teachers and students around the world
                            </p>
                            <Row className="justify-content-start align-items-center my-3">
                                <Col xs={6} sm={3}>
                                    <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                        <img src="/assets/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='img-fluid footer-org-logo' />
                                    </a>
                                </Col>
                                <Col xs={6} sm={3}>
                                    <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                        <img src="/assets/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='img-fluid footer-org-logo' />
                                    </a>
                                </Col>
                            </Row>
                            <Button className="mt-3" tag={Link} to="/topics" color="dark-primary">Explore topics</Button>
                        </Col>
                        <Col xs={12} lg={5} className={"mb-1 mb-sm-3 mb-lg-0"}>
                            {isLoggedIn(user) ?
                                <div>
                                    <AdaHero2x1 className={"mt-5 mt-lg-0 bg-hero"}/>
                                    <FeaturedNewsItem item={featuredNewsItem} />
                                </div>
                                :
                                <AdaHero2x1 className={"mt-5 mt-lg-0 d-block"}/>
                            }
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="benefits-for-teachers-and-students">
                <Container className={"py-lg-6 py-5"}>
                    <Row>
                        <Col lg={6} className={"px-5 my-auto my-lg-0"}>
                            <picture>
                                <source srcSet="/assets/cs/decor/benefits-for-homepage-3x4.webp" type="image/webp"/>
                                <img className={"d-none d-lg-block w-100"} src={"/assets/cs/decor/benefits-for-homepage-3x4.png"} alt="" />
                            </picture>
                            <picture>
                                <source srcSet="/assets/cs/decor/benefits-for-homepage-4x3.webp" type="image/webp"/>
                                <img className={"d-lg-none d-block w-100"} src={"/assets/cs/decor/benefits-for-homepage-4x3.png"} alt="" />
                            </picture>
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
