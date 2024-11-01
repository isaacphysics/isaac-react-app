import React, {useEffect} from "react";
import {useGetNewsPodListQuery} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, CardBody, CardFooter, CardTitle, Col, Container, Row} from "reactstrap";
import {PATHS, SITE_TITLE, useDeviceSize} from "../../../services";
import {AdaHero2x1} from "../../elements/svg/AdaHero";
import {NewsCard} from "../../elements/cards/NewsCard";
import {AdaHomepageSearch} from "../../elements/SearchInputs";
import {MetaDescription} from "../../elements/MetaDescription";
import classNames from "classnames";
import { ImageBlock } from "../../elements/layout/ImageBlock";
import { IconCard } from "../../elements/cards/IconCard";
import { TextBlock } from "../../elements/layout/TextBlock";
import { ColumnSlice } from "../../elements/layout/ColumnSlice";
import { AdaCard } from "../../elements/cards/AdaCard";

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const {data: news} = useGetNewsPodListQuery({subject: "news"});
    const featuredNewsItem = news ? news[0] : undefined;
    const deviceSize = useDeviceSize();

    return <>
        {/*<WarningBanner/>*/}
        <MetaDescription description={"Ada Computer Science is a free online computer science programme for students and teachers. Learn by using our computer science topics and questions!"}/>
        <div id="homepage">
            <section id="call-to-action" className="homepageHero">
                <Container className="homepage-padding mw-1600" fluid>
                    <Row>
                        <TextBlock lg={7}>
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
                        </TextBlock>
                        <ImageBlock lg={5} className={"mb-1 mb-sm-3 mb-lg-0"}>
                            <AdaHero2x1 className={"mt-5 mt-lg-0 d-block"}/>
                        </ImageBlock>
                    </Row>
                </Container>
            </section>
            <section id="news-and-updates">
                <Container className="homepage-padding mw-1600 position-relative" fluid>
                    <img className="full-background-img" src="/assets/cs/decor/swirls.svg" alt=""/>
                    <ColumnSlice>
                        <TextBlock className="pe-5">
                            <h2>Our latest updates</h2>
                            <p>We&apos;re constantly working to improve your experience with Ada Computer Science. Read the latest news and updates from the team.</p>
                        </TextBlock>
                        {featuredNewsItem && featuredNewsItem.title && featuredNewsItem.value ? <IconCard card={{
                            title: featuredNewsItem.title,
                            icon: {src: "/assets/cs/icons/book.svg"},
                            bodyText: featuredNewsItem.value,
                            tag: "New",
                            clickUrl: featuredNewsItem.url,
                            buttonText: "Read more",
                            buttonStyle: "link"
                        }}/> : <div/>}
                    </ColumnSlice>
                </Container>
            </section>
            <section id="benefits-for-teachers-and-students" className="bg-white">
                <Container className={"homepage-padding mw-1600"}>                    
                    <Row className={"align-items-center"}>
                        <Col xs={12} lg={5} className="mt-4 mt-lg-4 order-1 order-lg-0">
                            <picture>
                                <source srcSet="/assets/cs/decor/benefits-for-homepage.png" type="image/png"/>
                                <img className={"d-block w-100 mw-760 px-sm-5 px-lg-0"} src={"/assets/cs/decor/benefits-for-homepage.png"} alt="" />
                            </picture>
                        </Col>
                        <Col xs={12} lg={7}>
                            <h2 className={"font-size-1-75 mb-4"}>What we offer</h2>
                            <ul className={"font-size-1 font-size-md-1-25"}>
                                <li>Free computer science resources: Tailored for students aged 14 to 19</li>
                                <li>Interactive questions: Over 1000 questions with instant marking and feedback</li>
                                <li>Teacher tools: Set quizzes and assignments effortlessly</li>
                                <li>AI and machine learning resources: Stay ahead of the AI curve</li>
                                <li>Complete curriculums: For
                                    {" "}<a href={"/exam_specifications_england#gcse/aqa"}>GCSE</a>,
                                    {" "}<a href={"/exam_specifications_england#a_level/aqa"}>A&nbsp;Level</a>,
                                    {" "}<a href={"/exam_specifications_scotland#scotland_national_5/sqa"}>National&nbsp;5</a>,
                                    {" "}<a href={"/exam_specifications_scotland#scotland_higher/sqa"}>Higher</a>, and
                                    {" "}<a href={"/exam_specifications_scotland#scotland_advanced_higher/sqa"}>Advanced&nbsp;Higher</a></li>
                            </ul>
                            <div>
                                <Button className="mt-3 me-3" tag={Link} to="/students" color="primary">Student Resources</Button>
                                <Button className="mt-3" tag={Link} to="/teachers" color="primary">Teacher Resources</Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section id="question-finder">
                <Container className={"homepage-padding mw-1600"}>
                    <ColumnSlice>
                        <TextBlock>
                            <h2 className={"font-size-1-75 mb-4"}>Questions for classwork, homework, and exam prep</h2>
                            <p>
                                Explore our bank of over 1000 self-marking questions. Filter by topic, concept, and qualification.
                            </p>
                            <p><b>For students</b>: Learn or revise a topic and receive instant feedback.</p>
                            <p><b>For teachers</b>: Save time by creating self-marking quizzes for your class.</p>
                            <Button className={"mt-4"} tag={Link} to={PATHS.QUESTION_FINDER} color='primary'>
                                Find questions
                            </Button>
                        </TextBlock>
                        <ImageBlock>
                            <picture>
                                <source srcSet="/assets/cs/decor/question-finder-clean.svg" type="image/png"/>
                                <img className={"d-block w-100"} src={"/assets/cs/decor/question-finder-clean.svg"} alt="" />
                            </picture>
                        </ImageBlock>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="further-learning" className="bg-white">
                <Container className="homepage-padding mw-1600" fluid>
                    <TextBlock md={8}>
                        <h2>More learning resources</h2>
                    </TextBlock>
                    <ColumnSlice>
                        <AdaCard card={{
                            title: "Student challenges",
                            image: {src: "/assets/cs/decor/student-challenges.png"},
                            bodyText: "Our student challenge programme is designed to encourage and recognise  achievements as students progress through their studies. Take part and get entered to win prizes!",
                            clickUrl: "/pages/student_challenges",
                            buttonText: "Explore challenges",
                            className: "bg-cultured-grey",
                        }}/>
                        <AdaCard card={{
                            title: "Computer science stories",
                            image: {src: "/assets/cs/decor/lella.png"},
                            bodyText: "Read our interviews with computer scientists who are doing amazing things in a huge range of computing-related fields.",
                            clickUrl: "/pages/computer_science_stories",
                            buttonText: "Read more",
                            className: "bg-cultured-grey",
                        }}/>
                        <AdaCard card={{
                            title: "Online professional development",
                            image: {src: "/assets/cs/decor/teacher-2.png"},
                            bodyText: "20+ training courses, written specifically for computing teachers. No programming experience is needed. Great for keeping up with CPD requirements.",
                            clickUrl: "/pages/online_courses",
                            buttonText: "Find out more",
                            className: "bg-cultured-grey",
                        }}/>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="what-resources">
                <Container className={"homepage-padding mw-1600"}>
                    <TextBlock md={8}>
                        <h2 className={"font-size-1-75 mb-4"}>Teaching outside the UK?</h2>
                        <p>We&apos;ve organised our learning resources by prior knowledge and age group to make them easy to adapt for curricula around the world.</p>
                    </TextBlock>
                    <ColumnSlice>
                        <Container className="cs-card-container px-3 my-3">
                            <Card className={classNames("cs-card-plain w-100 border-0 backslash-1")}>
                                <CardTitle className={"px-4 mt-5"}>
                                    <h3 className={"mt-1 font-size-1-5"}>Core</h3>
                                </CardTitle>
                                <CardBody className={"px-4 pb-4"}>
                                    <ul className="mb-4">
                                        <li>For students aged 14 to 16</li>
                                        <li>Gives learners a strong theoretical and practical knowledge of the basics of computer science</li>
                                        <li>Suitable for students with no previous knowledge</li>
                                    </ul>
                                </CardBody>
                                <CardFooter className="border-top-0 p-4">
                                    <Button outline to="/exam_specifications_ada#core/ada" color='secondary' tag={Link}>See more</Button>
                                </CardFooter>
                            </Card>
                        </Container>
                        <Container className="cs-card-container px-3 my-3">
                            <Card className={classNames("cs-card-plain w-100 border-0 backslash-2")}>
                                <CardTitle className={"px-4 mt-5 font-size-1-5"}>
                                    <h3 className={"mt-1"}>Advanced</h3>
                                </CardTitle>
                                <CardBody className={"px-4 pb-4"}>
                                    <ul className="mb-4">
                                        <li>For students aged 16 to 19</li>
                                        <li>Expands on the concepts learnt in the Core curriculum with more detail</li>
                                        <li>Covers more advanced concepts that are not in the Core curriculum</li>
                                        <li>Prepares students for a university degree / degree apprenticeship programme</li>
                                    </ul>
                                </CardBody>
                                <CardFooter className="border-top-0 p-4">
                                    <Button outline to="/exam_specifications_ada#advanced/ada" color='secondary' tag={Link}>See more</Button>
                                </CardFooter>
                            </Card>
                        </Container>
                    </ColumnSlice>
                </Container>
            </section>

            {news && news.length > 0 && <section id="news" className="bg-white">
                <Container className={"homepage-padding mw-1600"}>
                    <h2 className={"font-size-1-75 mb-4"}>News</h2>
                    <Row xs={12} data-testid={"news-pod-deck"} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around my-3">
                        {news.slice(0, deviceSize === "lg" ? 3 : 4).map((n, i) => <NewsCard key={i} newsItem={n} showTitle cardClassName="bg-cultured-grey" />)}
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
