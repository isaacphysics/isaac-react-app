import React, {useEffect} from "react";
import {
    selectors,
    transientUserContextSlice,
    useAppDispatch,
    useAppSelector,
    useGetNewsPodListQuery
} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardDeck, Col, Container, Row} from "reactstrap";
import {EXAM_BOARD, history, isLoggedIn, SITE_TITLE, STAGE} from "../../../services";
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
    const dispatch = useAppDispatch();
    const setStage = (stage: STAGE) => dispatch(transientUserContextSlice?.actions.setStage(stage));
    const setExamBoard = (examBoard: EXAM_BOARD) => dispatch(transientUserContextSlice?.actions.setExamBoard(examBoard));

    return <>
        {/*<WarningBanner/>*/}
        <MetaDescription description={"Ada Computer Science is a free online computer science programme for students and teachers. Learn by using our computer science topics and questions!"}/>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="py-5 px-md-4 px-xxl-5 mw-1600" fluid>
                    <Row className={"justify-content-center"}>
                        <Col xs={12} lg={7} className={"my-auto"}>
                            <h1 className={"font-size-1-75 font-size-md-2-5"}>
                                <span className={"text-pink"}>/</span><br/>
                                Computer science education should be accessible for everyone
                            </h1>
                            <p className={"font-size-1-25 py-3"}>
                                We create free resources to help teachers and students around the world
                            </p>
                            <Row className="justify-content-start align-items-center my-3">
                                <Col xs={6} sm={3}>
                                    <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                        <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='img-fluid footer-org-logo' />
                                    </a>
                                </Col>
                                <Col xs={6} sm={3}>
                                    <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                        <img src="/assets/common/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='img-fluid footer-org-logo' />
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
            <section id="scotland-slice">
                <Container className={"py-5 px-md-4 px-xxl-5"}>
                    <Card id="scotland-slice-card" className={"border-0"}>
                        <CardBody>
                            <Row className="align-items-center justify-content-between">
                                <Col xs={12} lg={8}>
                                    <h4>Hey, folks in Scotland! <img className="pb-1" height="24px" src="/assets/cs/icons/flag-sco.svg" alt=""/> Looking for SQA resources?</h4>
                                    <p>We&apos;ve mapped our content to the N5 and Higher specifications.</p>
                                </Col>
                                <Col xs={12} lg={3}>
                                    <Button
                                        className={"align-self-end mt-auto"}
                                        onClick={
                                            () => {
                                                setStage(STAGE.ALL);
                                                setExamBoard(EXAM_BOARD.SQA);
                                                history.push("/concepts/sqa_computing_science");
                                            }
                                        }>Show me</Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Container>
            </section>
            <section id="benefits-for-teachers-and-students">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <Row className={"align-items-center"}>
                        <Col xs={12} lg={6}>
                            <h2 className={"font-size-1-75 mb-4"}>Why use Ada Computer Science?</h2>
                            <ul className={"font-size-1 font-size-md-1-25"}>
                                <li>Made by the University of Cambridge and the Raspberry Pi Foundation</li>
                                <li>Mapped to <strong><Link to={"/exam_specifications"}>computer science exam specifications</Link></strong>, including GCSE and A level</li>
                                <li>A great way to save time when planning lessons and homework</li>
                                <li>Perfect for learning a topic after class or preparing for exams</li>
                                <li>Free forever — no hidden costs</li>
                            </ul>
                        </Col>
                        <Col xs={12} lg={6} className={"mt-4 mt-lg-0"}>
                            <picture>
                                <source srcSet="/assets/cs/decor/benefits-for-homepage.webp" type="image/webp"/>
                                <img className={"d-block w-100"} src={"/assets/cs/decor/benefits-for-homepage.png"} alt="" />
                            </picture>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="question-finder">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <Row className={"align-items-center"}>
                        <Col xs={12} lg={6}>
                            <h2 className={"font-size-1-75 mb-4"}>Explore our questions</h2>
                            <p>
                                Use the question finder to explore more than 1,000 self-marking questions, filtering by
                                topic, concept and qualification. Written by experts and updated frequently, they
                                address common misconceptions with tailored feedback.
                            </p>
                            <p><b>Students</b>: review key topics and get instant feedback</p>
                            <p><b>Teachers</b>: save time by creating self-marking quizzes</p>
                            <Button className={"mt-4"} tag={Link} to="/quizzes/new" color='primary'>
                                Try our question finder
                            </Button>
                        </Col>
                        <Col xs={12} lg={6} className={"mt-4 mt-lg-0"}>
                            <picture>
                                <source srcSet="/assets/cs/decor/question-finder.png" type="image/png"/>
                                <img className={"d-block w-100"} src={"/assets/cs/decor/question-finder.png"} alt="" />
                            </picture>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="what-resources">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <h2 className={"font-size-1-75 mb-5"}>What resources are you looking for?</h2>
                    <IsaacCardDeck
                        doc={{
                            cards: [{
                                title: "Core",
                                subtitle: "Aimed at students aged 14-16, these resources cover core concepts in computer science for students working towards qualifications like GCSEs and National 5s.",
                                imageClassName: "backslash-1"
                            }, {
                                title: "Advanced",
                                subtitle: "Aimed at students aged 16-19, these resources cover advanced concepts. They are useful for students studying for A levels and Advanced Placement courses, and those heading towards further education.",
                                imageClassName: "backslash-2"
                            }]
                        }}
                        className={"homepage-cards"}
                        containerClassName={"mw-1600"}
                    />
                    <Col xs={12} sm={{size: 8, offset: 2}} md={{size: 6, offset: 3}} lg={{size: 4, offset: 4}} className="d-flex justify-content-center">
                        <Button className="w-100" tag={Link} to="/topics" color="primary" outline>Explore all resources</Button>
                    </Col>
                </Container>
            </section>

            <section id="computer-science-stories">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <Row>
                        <Col xs={12} lg={6} id={"cs-stories-text"}>
                            <h2 className={"font-size-1-75 mb-4"}>Computer science stories</h2>
                            <p className={"mb-4"}>
                                Discover our monthly interview series and learn from passionate educators within the
                                Ada community, and recently-graduated computer scientists who are doing AMAZING things
                                in a huge range of computing-related fields!
                            </p>
                            <Button tag={Link} to="/pages/computer_science_stories" color="primary">Read their stories</Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {news && news.length > 0 && <section id="news">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <h2 className={"font-size-1-75 mb-4"}>News</h2>
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
