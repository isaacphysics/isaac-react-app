import React, {useEffect} from "react";
import {
    selectors,
    transientUserContextSlice,
    useAppDispatch,
    useAppSelector,
    useGetNewsPodListQuery
} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardTitle, Col, Container, Row} from "reactstrap";
import {EXAM_BOARD, isLoggedIn, SITE_TITLE, STAGE, useDeviceSize} from "../../../services";
import {AdaHero2x1} from "../../elements/svg/AdaHero";
import {FeaturedNewsItem} from "../../elements/FeaturedNewsItem";
import {NewsCard} from "../../elements/cards/NewsCard";
import {AdaHomepageSearch} from "../../elements/SearchInputs";
import {MetaDescription} from "../../elements/MetaDescription";
import classNames from "classnames";

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);
    const {data: news} = useGetNewsPodListQuery({subject: "news"});
    const featuredNewsItem = (news && user?.loggedIn) ? news[0] : undefined;
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
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
                                The free learning platform for computing teachers and students
                            </h1>
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
                            <Button className="mt-3" tag={Link} to="/topics" color="dark-primary">Explore our resources</Button>
                        </Col>
                        <Col xs={12} lg={5} className={"mb-1 mb-sm-3 mb-lg-0"}>
                            {isLoggedIn(user) ?
                                <div className="position-relative">
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
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <Row className={"align-items-center"}>
                        <Col xs={12} lg={6}>
                            <h2 className={"font-size-1-75 mb-4"}>What we offer</h2>
                            <ul className={"font-size-1 font-size-md-1-25"}>
                                <li><b>Free computer science resources:</b> Tailored for students aged 14 to 19</li>
                                <li><b>Interactive questions:</b> Over 1000 questions with instant marking and feedback</li>
                                <li><b>Teacher tools:</b> Set quizzes and assignments effortlessly</li>
                                <li><b>AI and machine learning resources:</b> Stay ahead of the AI curve</li>
                                <li><b>Complete curriculums:</b> For GCSE, A Level, National 5, Higher, and Advanced Higher</li>
                            </ul>
                            {!isLoggedIn(user) &&
                                <Button className="mt-3" tag={Link} to="/register" color="primary">Join</Button>
                            }
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
                            <h2 className={"font-size-1-75 mb-4"}>Questions for classwork, homework, and exam prep</h2>
                            <p>
                                Explore our bank of over 1000 self-marking questions. Filter by topic, concept, and qualification.
                            </p>
                            <p><b>For students</b>: Learn or revise a topic and receive instant feedback.</p>
                            <p><b>For teachers</b>: Save time by creating self-marking quizzes for your class.</p>
                            <Button className={"mt-4"} tag={Link} to="/quizzes/new" color='primary'>
                                Find questions
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
                    <h2 className={"font-size-1-75 mb-4"}>Our Core and Advanced global resources</h2>
                    <p>
                        Teaching or learning from outside the UK? We&apos;ve organised our learning resources by prior
                        knowledge and age group to make them easy to adapt for curricula in other countries.
                    </p>
                    <Row className={"mt-5"}>
                        <Col xs={12} xl={6} className={"mb-5 mb-xl-0"}>
                            <Card className={classNames("cs-card border-0 backslash-1 w-100")}>
                                <CardTitle className={"px-4 mt-5"}>
                                    <h3 className={"mt-1 font-size-1-5"}>Core</h3>
                                </CardTitle>
                                <CardBody className={"px-4"}>
                                    <ul>
                                        <li>For students aged 14 to 16</li>
                                        <li>Gives learners a strong theoretical and practical knowledge of the basics of
                                            computer science
                                        </li>
                                        <li>Suitable for students with no previous knowledge</li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col>
                            <Card className={classNames("cs-card border-0 backslash-2 w-100")}>
                                <CardTitle className={"px-4 mt-5 font-size-1-5"}>
                                    <h3 className={"mt-1"}>Advanced</h3>
                                </CardTitle>
                                <CardBody className={"px-4"}>
                                    <ul>
                                        <li>For students aged 16 to 19</li>
                                        <li>Expands on the concepts learnt in the Core curriculum with more detail</li>
                                        <li>Covers more advanced concepts that are not in the Core curriculum</li>
                                        <li>Prepares students for a university degree / degree apprenticeship
                                            programme
                                        </li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Col xs={12} sm={{size: 8, offset: 2}} md={{size: 6, offset: 3}} lg={{size: 4, offset: 4}} className=" mt-5 d-flex justify-content-center">
                        <Button className="w-100" tag={Link} to="/topics" color="primary" outline>Explore all resources</Button>
                    </Col>
                </Container>
            </section>

            {news && news.length > 0 && <section id="news">
                <Container className={"py-5 px-md-4 px-xxl-5 mw-1600"}>
                    <h2 className={"font-size-1-75 mb-4"}>News</h2>
                    <Row xs={12} data-testid={"news-pod-deck"} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around my-3">
                        {news.slice(0, deviceSize === "lg" ? 3 : 4).map((n, i) => <NewsCard key={i} newsItem={n} showTitle />)}
                    </Row>
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
