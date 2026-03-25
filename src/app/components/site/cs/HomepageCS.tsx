import React, {useEffect} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Link} from "react-router-dom";
import {Button, Card, Col, Container, Row} from "reactstrap";
import {isLoggedIn, isTeacherOrAbove, SITE_TITLE} from "../../../services";
import {MetaDescription} from "../../elements/MetaDescription";
import { ImageBlock } from "../../elements/layout/ImageBlock";
import { IconCard } from "../../elements/cards/IconCard";
import { TextBlock } from "../../elements/layout/TextBlock";
import { ColumnSlice } from "../../elements/layout/ColumnSlice";
import { AdaNewsSection } from "../../elements/AdaNewsSection";

export const HomepageCS = () => {
    useEffect( () => {document.title = SITE_TITLE;}, []);
    const user = useAppSelector(selectors.user.orNull);

    return <>
        {/*<WarningBanner/>*/}
        <MetaDescription description={"Ada Computer Science is a free online computer science programme for students and teachers. Learn by using our computer science topics and questions!"}/>
        <div id="homepage">

            <section id="call-to-action" className="homepageHero">
                <Container id={"cta-container"} fluid>
                    <div className="d-flex flex-column align-items-center gap-5">
                        <div className={""}>
                            <h1 className={"backslash-left-small text-center font-size-2 font-size-md-2-5 mb-0"}>The free learning platform for computing teachers and students</h1>
                        </div>
                        <div className="d-flex flex-row w-100 align-items-center justify-content-center">
                            <div className={"mx-5"}>
                                <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                    <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='img-fluid footer-org-logo' />
                                </a>
                            </div>
                            <div className={"mx-5"}>
                                <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                    <img src="/assets/common/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='img-fluid footer-org-logo' />
                                </a>
                            </div>
                        </div>
                        <div>
                            {isLoggedIn(user) && isTeacherOrAbove(user) &&
                                <Button color={"dark-primary"} tag={Link} to={"/dashboard"}>Go to My Ada Overview</Button>}
                        </div>
                    </div>
                </Container>
                <Container className={"mw-1600 homepage-padding-x"} fluid>
                    <Card id={"cta-features-card"} className={"icon-card p-5"}>
                        <Row className={"justify-content-center gy-5 fw-bold"}>
                            <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                                Free computer science resources for students aged 14 to 19
                            </Col>
                            <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                                Instant feedback with self-marking quizzes
                            </Col>
                            <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                                Track progress in your personal markbook
                            </Col>
                            <Col xs={12} md={6} lg={3} className={"cta-feature"}>
                                Specific exam alignment for the UK and adaptable to use worldwide
                            </Col>
                        </Row>
                    </Card>
                </Container>
            </section>

            <section id="teach-and-learn">
                <Container className="homepage-padding mw-1600" fluid>
                    <div className="d-flex flex-column gap-5 align-items-center">
                        <h2 className={"font-size-1-75 font-size-md-2 text-center"}>Teach and learn about computer science with confidence</h2>
                        <Card className={"icon-card w-100 p-5"}>
                            <ColumnSlice>
                                <TextBlock>
                                    <h3 className={"font-size-1-5 font-size-md-1-75"}>Resources you can trust</h3>
                                    <ul>
                                        <li>More than 50 curriculum-aligned topics covering the breadth of computer science</li>
                                        <li>Clear concept pages for every key topic</li>
                                        <li>Created in collaboration with the University of Cambridge</li>
                                        <li>Termly student challenges to test skills and win prizes</li>
                                    </ul>
                                </TextBlock>
                                <ImageBlock>
                                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/concepts-slice.svg" alt=""/>
                                </ImageBlock>
                            </ColumnSlice>
                        </Card>
                        <Card className={"icon-card w-100 p-5"}>
                            <ColumnSlice>
                                <ImageBlock>
                                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/markbook-slice.svg" alt=""/>
                                </ImageBlock>
                                <TextBlock>
                                    <h3 className={"font-size-1-5 font-size-md-1-75"}>Tools to aid learning</h3>
                                    <ul>
                                        <li>Self-marking assessments that save time and support independent learning and revision</li>
                                        <li>Over 1000 questions that provide instant feedback to students</li>
                                        <li>Identify knowledge gaps and tailor teaching with class and student progress insights</li>
                                        <li>Students see their own progress over time and discover where to improve</li>
                                    </ul>
                                </TextBlock>
                            </ColumnSlice>
                        </Card>
                    </div>
                    <div className={"d-flex w-100 justify-content-center"}>
                        <div className={"d-flex flex-column flex-md-row gap-4 mt-7 align-items-center"}>
                            <Button tag={Link} to={"/teachers"}>
                                Explore Ada CS for teachers
                            </Button>
                            <Button tag={Link} to={"/students"}>
                                Explore Ada CS for students
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>

            <section id="testimonial" className="bg-black">
                <Container className="homepage-padding mw-1600" fluid>
                    <ColumnSlice className={"align-items-start row-gap-4"}>
                        <TextBlock className="backslash-left text-white">
                            <h2 className={"font-size-1-75"}>
                                &rdquo;Ada Computer Science has eliminated the need for textbooks for A level computer science. There is rarely a need for any other sources of information when planning lessons and it’s free!&rdquo;
                            </h2>
                            <span>– Computer science teacher</span>
                        </TextBlock>
                        <TextBlock className="backslash-left text-white">
                            <h2 className={"font-size-1-75"}>
                                &ldquo;
                                I love Ada CS! The content featured is very comprehensive and detailed, and the visual guides through topics like sorts are particularly helpful to aid my understanding.
                                &rdquo;
                            </h2>
                            <span>– Computer science student</span>
                        </TextBlock>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="what-resources">
                <Container className={"homepage-padding mw-1600"}>
                    <TextBlock md={8}>
                        <h2 className={"font-size-1-75 mb-4"}>Exam board alignment</h2>
                        <p className={"font-size-1-25"}>We&apos;ve organised our learning resources so they can be easily used, wherever you are.</p>
                    </TextBlock>
                    <ColumnSlice breakpoint="md">
                        <IconCard card={{
                            title: "In the UK",
                            icon: {name: "icon-location-on", color: "secondary"},
                            clickUrl: "/exam_specifications",
                            buttonText: "See more",
                            buttonStyle: "link",
                        }}>
                            <p>Find resources tailored to the specific learning levels and exam boards in the UK:</p>
                            <ul>
                                <li><b>England:</b> GCSE and A Level</li>
                                <li><b>Scotland:</b> National 5, Higher, and Advanced Higher</li>
                                <li><b>Wales:</b> GCSE and A Level</li>
                            </ul>
                        </IconCard>
                        <IconCard card={{
                            title: "Teaching outside the UK",
                            icon: {name: "icon-globe", color: "secondary"},
                            clickUrl: "/exam_specifications_ada",
                            buttonText: "See more",
                            buttonStyle: "link",
                        }}>
                            <p>Learning resources tailored to prior knowledge and learning age groups:</p>
                            <ul>
                                <li><b>Core:</b> Aimed at students aged 14 to 16, with no previous knowledge needed.</li>
                                <li><b>Advanced:</b> Aimed at students aged 16 to 19, expands on concepts learned in the Core curriculum.</li>
                            </ul>
                        </IconCard>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="account">
                <Container className="homepage-padding mw-1600 position-relative" fluid>
                    <ColumnSlice>
                        <TextBlock>
                            <h2 className={"font-size-2"}>Manage workload and track progress with an Ada CS account</h2>
                            <div className={"font-size-1-25"}>
                                <p>You can use any of our learning resources wherever you are, without an Ada CS account.</p>
                                <p>An Ada CS account gets you access to lots of useful tools. Organise students into groups, set self-marking assignments, and track progress to identify learning opportunities.</p>
                                <p>It’s totally free to use Ada CS, with or without an account.</p>
                            </div>
                            <Button className={"mt-3"} color={"primary"} tag={Link} to={"/register"}>Create an account</Button>
                        </TextBlock>
                        <ImageBlock>
                            <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/tools-slice.svg" alt=""/>
                        </ImageBlock>
                    </ColumnSlice>
                </Container>
            </section>

            <section id="news" className="bg-white">
                <Container className="homepage-padding mw-1600" fluid>
                    <AdaNewsSection isHomepage />
                </Container>
            </section>
        </div>
    </>;
};
