import React from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { IconCard } from "../elements/cards/IconCard";
import { useGetNewsPodListQuery } from "../../state";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";

export const TeacherResources = () => {
    const {data: teacherPods} = useGetNewsPodListQuery({subject: "news"});
    const featuredPod = teacherPods?.[0];

    return <>
        <section id="resources-header" className="bg-dark-pink">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock className="text-white">
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <span className="text-pink">/</span><br/>
                            Resources for teachers
                        </h1>
                        <p>Classwork, homework, and exam prep to help you teach computer science. All available for free.</p>
                    </TextBlock>
                    <img className="px-5" src="/assets/cs/decor/teacher-1.png" alt=""/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="latest-updates">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 position-relative" fluid>
                <div className="w-100 h-100 position-absolute swirls-img"/>
                <ColumnSlice>
                    <TextBlock className="pe-5">
                        <h2>Our latest updates</h2>
                        <p>We&apos;re constantly working to improve your experience with Ada Computer Science. Read the latest news and updates from the team.</p>
                    </TextBlock>
                    {featuredPod && featuredPod.title && featuredPod.value ? <IconCard card={{
                        title: featuredPod.title,
                        icon: {src: "/assets/cs/icons/book.svg"},
                        bodyText: featuredPod.value,
                        tag: "New",
                        clickUrl: featuredPod.url,
                        buttonText: "Read more",
                        buttonStyle: "link"
                    }}/> : <div/>}
                </ColumnSlice>
            </Container>

            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-white" fluid>
                <ColumnSlice>
                    <img className="p-4" src="/assets/cs/decor/questions.png" alt=""/>
                    <TextBlock>
                        <h2>A full curriculum of topics</h2>
                        <p>We have over 65 learning topics that cover everything you need to teach computer science. From computing systems and networks, to AI, machine learning, and much more.</p>
                        <p>They&apos;re created by expert educators and are regularly updated. You can even filter content for different age groups and exams.</p>
                        <Button tag={Link} to={"/topics"}>Explore all topics</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="tools" className="position-relative">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600" fluid>
                <div className="w-100 h-100 position-absolute swirls-img-2"/>
                <TextBlock xs={8}>
                    <h2>Tools to help you teach</h2>
                    <p>An Ada account makes it easy to assess your students. Set assignments to reinforce learning from lessons and use our pre-made tests to check student knowledge.</p>
                    <Button className="me-3" to={"/register"} tag={Link}>Create an account</Button>
                    <Button outline to={"/login"} tag={Link}>Log in</Button>
                </TextBlock>
                <ColumnSlice>
                    <IconCard card={{
                        title: "See content specific to you",
                        icon: {src: "/assets/cs/icons/tune-cyan.svg"},
                        bodyText: "Set your location, level, and exam board, and we'll show you the content most relevant to you.",
                        clickUrl: "/account",
                        buttonStyle: "card",
                    }}/>
                    <IconCard card={{
                        title: "Create student groups",
                        icon: {src: "/assets/cs/icons/group-cyan.svg"},
                        bodyText: "Organise your students into groups and set work appropriate for each group.",
                        clickUrl: "/groups",
                        buttonStyle: "card",
                    }}/>
                    <IconCard card={{
                        title: "Set assignments",
                        icon: {src: "/assets/cs/icons/file-cyan.svg"},
                        bodyText: "Create self-marking assignments for your students. There are over 1000 questions for you to choose from.",
                        clickUrl: "/quizzes/set",
                        buttonStyle: "card",
                    }}/>
                    <IconCard card={{
                        title: "Review your markbook",
                        icon: {src: "/assets/cs/icons/search-cyan.svg"},
                        bodyText: "Track student progress with a personal markbook to help pinpoint areas to work on.",
                        clickUrl: "/my_markbook",
                        buttonStyle: "card",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="cpd">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-white" fluid>
                <TextBlock xs={8}>
                    <h2>Professional development</h2>
                    <p>Learn new skills and build confidence with our free courses for continuing professional development (CPD). They&apos;re designed to support you, whatever your level of experience.</p>
                </TextBlock>
                <ColumnSlice>
                    <AdaCard card={{
                        title: "Free online courses",
                        image: {src: "/assets/cs/decor/teacher-2.png"},
                        bodyText: "Join one of our self-guided courses for teachers covering a wide range of computing topics.",
                        clickUrl: "/pages/online_courses",
                        buttonText: "Learn more",
                    }}/>
                    <AdaCard card={{
                        title: "Teacher mentoring",
                        image: {src: "/assets/cs/decor/teacher-3.png"},
                        bodyText: "Get support through our online programme for newly-qualified and non-specialist computer science teachers.",
                        clickUrl: "/pages/teacher_mentoring_2024",
                        buttonText: "Learn more",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="more-resources">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/decor-cyan.png" alt=""/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Student challenges</h2>
                        <p>Encourage and reward student success with our student challenge programme, designed to inspire achievement at every stage of their studies.</p>
                        <Button tag={Link} to={"/student_challenges"}>Find out more</Button>
                    </TextBlock>
                    {/* TODO: this is currently hard-coded because challenges aren't retrievable via an API call */}
                    <IconCard card={{
                        title: "Enigma challenge",
                        icon: {src: "/assets/cs/icons/lightbulb-cyan.svg"},
                        bodyText: "Join the Enigma Challenge now to prepare for stage 1 of this year's exciting competition!",
                        tag: "Starting 1st October",
                        clickUrl: "/TODO",
                        buttonText: "Read more",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>

            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-white" fluid>
                <TextBlock xs={8}>
                    <h2>More teaching resources</h2>
                    <p>Support, lesson plans, ideas, and tools from thr Raspberry Pi Foundation&apos;s world class range of computer science resources.</p>
                </TextBlock>
                <ColumnSlice>
                    <AdaCard card={{
                        title: "Research projects",
                        image: {src: "/assets/cs/decor/teacher-4.png"},
                        bodyText: "Discover groundbreaking research that advances the understanding of how people learn about computing. These projects are a collaboration between the Raspberry Pi Foundation and the University of Cambridge.",
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/research/projects",
                    }}/>
                    <AdaCard card={{
                        title: "Hello World magazine",
                        image: {src: "/assets/cs/decor/hello-world.png"},
                        bodyText: "Get a global perspective on computing education with Hello World–our magazine and podcast for educators. Share your expertise and write for us!",
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/hello-world",
                    }}/>
                    <AdaCard card={{
                        title: "Code Editor for Education",
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: "Our free code editor makes it easy for young people to learn text-based programming. It's safe, age-appropriate, and suitable for use in the classroom.",
                        buttonText: "Learn more",
                        clickUrl: "https://editor.raspberrypi.org/en/education",
                    }}/>
                </ColumnSlice>
            </Container>

            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-black" fluid>
                <TextBlock xs={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        &ldquo;Ada Computer Science has eliminated the need for textbooks for A level Computer Science. There is rarely a need for any other sources of information when planning lessons and it&apos;s free!&rdquo;
                    </h2>
                    <p>– Matt Arnmor, computer science teacher</p>
                </TextBlock>
            </Container>
        </section>
        <section id="help-and-support">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 position-relative bg-white" fluid>
                <TextBlock className="text-white text-center m-3 p-5 help-block">
                    <h3>Need help?</h3>
                    <p>Our teacher support page has lots of information for common questions and issues.</p>
                    <Button outline className="bg-white" to="/support" tag={Link}>Teacher support</Button>
                </TextBlock>
            </Container>
        </section>
    </>;
};
