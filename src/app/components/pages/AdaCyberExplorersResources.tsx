import React from "react";
import { MetaDescription } from "../elements/MetaDescription";
import { Badge, Button, Card, CardBody, Container } from "reactstrap";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router";
import { IconCard } from "../elements/cards/IconCard";

export const AdaCyberExplorersResources = () => {
    return <>
        <MetaDescription description={"Resources for students and teachers for ages 11-14."} />

        <section id="ada-11-14-header" className="bg-cyan-400">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h1 className="font-size-2-5 font-size-md-2-5 mb-3">
                            <span className="text-pink">/</span><br/>
                            Build the skills to shape tomorrow: Ages 11 to 14
                        </h1>
                        <p className="font-size-1-25">Practical activities that help learners understand technology, build confidence, and prepare for what&apos;s next.</p>
                        <p className="font-size-1-25">Always available for free.</p>
                        <Button outline className="bg-white" href="/topics#11-14">Explore learning topics</Button>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-5.png" alt="A teacher assisting two students."/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <div className="d-flex position-absolute justify-self-center gap-4 py-4 px-5 bg-white rounded-4 translate-middle-y shadow-pink z-1">
            <img src="/assets/common/logos/funded-by-uk-govt-black.svg" alt='Funded by the UK Government' className='img-fluid' />
            <img src="/assets/common/logos/techfirst-black.svg" alt='The TechFirst logo' className='img-fluid' />
        </div>
        <section id="cyber-explorers">
            <Container className="homepage-padding mw-1600 d-flex flex-column align-items-center" fluid>
                <div className="text-center w-lg-75 mb-4 text-white">
                    <h2 className="font-size-2 mt-5">Cyber Explorers welcome</h2>
                    <p className="font-size-1-25 mt-3">Explore familiar cyber security resources alongside new computing and technology content for learners.</p>
                </div>
                <ColumnSlice breakpoint="lg" reverseUnderBreakpoint className="row-gap-5">
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/cyber-explorers.svg" alt="A cartoon sketch of Cyber City"/>
                    </ImageBlock>
                    <TextBlock>
                        <Card>
                            <CardBody className="py-5">
                                <div className="d-flex gap-3">
                                    <i className="icon icon-learning icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">Familiar resources</h3>
                                        <p>The cyber security resources you know are now part of Ada CS, supported through our partnership with the UK Government.</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <i className="icon icon-search icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">More to explore</h3>
                                        <p>Alongside cyber security, Ada CS is growing with new topics and learning experiences for ages 11 to 14.</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-3">
                                    <i className="icon icon-group icon-md" color="secondary" />
                                    <div>
                                        <h3 className="font-size-1-25">Teaching tools</h3>
                                        <p className="mb-0">Create classes, assign activities, and track learners&apos; progress, all in one place.</p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </TextBlock>
                </ColumnSlice>
                <Button outline className="bg-white mt-5" href="/">Read more</Button>
            </Container>
        </section>
        <section id="11-14-topics" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="w-lg-75 mb-8">
                    <h2 className="font-size-2 mb-3">Choose a topic to explore</h2>
                    <p className="font-size-1-25">Build your skills through practical activities that help you understand how technology works and how it&apos;s used to solve real-world problems.</p>
                    <p className="font-size-1-25">Start with cyber security, with more topics coming soon.</p>
                    <Button tag={Link} to="/topics#11-14" className="mt-3">Explore all topics</Button>
                </div>

                <Card className="bg-cyan-200">
                    <CardBody className="position-relative">
                        <img className="full-background-img" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                        <h3 className="font-size-1-5 ms-3 my-3 d-flex gap-3 align-items-center">
                            Cyber security
                            <Badge color="pink-400" className="rounded-5 text-black font-size-1 fw-bold py-1">Coming soon</Badge>
                        </h3>
                        <div className="d-flex row row-cols-1 row-cols-sm-2 row-cols-lg-4 mt-3 w-100 g-0">
                            <IconCard className={"without-margin"} card={{
                                title: "Social engineering",
                                icon: {name: "icon-hook", color: "secondary"},
                                bodyText: "Stay safe online and learn how systems are attacked and defended.",
                                // clickUrl: "/social-engineering",
                                buttonText: "Explore",
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: "Malware",
                                icon: {name: "icon-bug", color: "secondary"},
                                bodyText: "Learn how malware works and how to recognise and defend against it.",
                                // clickUrl: "/malware",
                                buttonText: "Explore",
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: "Defending against malware",
                                icon: {name: "icon-shield-lock", color: "secondary"},
                                bodyText: "Explore the tools and techniques used to detect, stop, and remove malware.",
                                // clickUrl: "/defending-against-malware",
                                buttonText: "Explore",
                                buttonStyle: "link",
                            }}/>
                            <IconCard className={"without-margin"} card={{
                                title: "Network security",
                                icon: {name: "icon-globe-lock", color: "secondary"},
                                bodyText: "Discover how networks are protected from attacks and kept secure.",
                                // clickUrl: "/network-security",
                                buttonText: "Explore",
                                buttonStyle: "link",
                            }}/>
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </section>
        <section id="what-is-ada" className="bg-cultured">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice breakpoint="lg" reverseUnderBreakpoint className="row-gap-5">
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/panels-pink.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>What is Ada Computer Science?</h2>
                        <h3 className="font-size-1-25 mb-3">One place to learn computing, from ages 11 to 19.</h3>
                        <ul>
                            <li>Free computing resources, from practical activities for ages 11 to 14 to structured computer science learning for ages 14 to 19</li>
                            <li>Classroom tools to group students into classes, assign activities, and track learners&apos; progress</li>
                            <li>Expert content developed by the Raspberry Pi Foundation in collaboration with partners including the University of Cambridge</li>
                        </ul>
                        <div className="d-flex gap-3">
                            <Button href="/">Discover more of Ada CS</Button>
                            <Button outline className="bg-white" href="/register">Create an account</Button>
                        </div>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
    </>;
};
