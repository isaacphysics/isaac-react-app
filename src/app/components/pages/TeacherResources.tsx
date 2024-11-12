import React from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { IconCard } from "../elements/cards/IconCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";
import { isLoggedIn } from "../../services";
import { ImageBlock } from "../elements/layout/ImageBlock";
import classNames from "classnames";

export const TeacherResources = () => {
    const {data: teacherPods} = useGetNewsPodListQuery({subject: "news"});
    const {data: studentChallengesPods} = useGetNewsPodListQuery({subject: "student_challenges"});
    const featuredPod = teacherPods?.[0];
    const featuredStudentChallengePod = studentChallengesPods?.[0];

    const user = useAppSelector(selectors.user.orNull);

    return <div id="teacher-resources">
        <section id="resources-header" className="bg-dark-pink-200">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock className="text-white">
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <span className="text-pink">/</span><br/>
                            Ada for teachers
                        </h1>
                        <p>Classwork, homework, and exam prep to help you teach computer science. All available for free.</p>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-1.png" alt=""/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="latest-updates">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/swirls.svg" alt=""/>
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
        </section>
        <section id="curriculum" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice reverseUnderBreakpoint>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/questions.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>A full curriculum of topics</h2>
                        <p>We have over 65 learning topics that cover everything you need to teach computer science. From computing systems and networks, to AI, machine learning, and much more.</p>
                        <p>They&apos;re created by expert educators and are regularly updated. You can even filter content for different age groups and exams.</p>
                        <Button tag={Link} to={"/topics"}>Explore all topics</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="tools">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/swirls.svg" alt=""/>
                <TextBlock md={8} className={classNames({"mb-3": !isLoggedIn(user)})}>
                    <h2>Tools to help you teach</h2>
                    <p>An Ada account makes it easy to assess your students. Set assignments to reinforce learning from lessons and use our pre-made tests to check student knowledge.</p>
                    {!isLoggedIn(user) && <div className="pb-2 mb-3">
                        <Button className="me-3" to={"/register"} tag={Link}>Create an account</Button>
                        <Button outline to={"/login"} tag={Link}>Log in</Button>
                    </div>}
                </TextBlock>
                <ColumnSlice>
                    <IconCard card={{
                        title: "See content specific to you",
                        icon: {src: "/assets/cs/icons/tune-cyan.svg"},
                        bodyText: "Set your location, level, and exam board, and we'll show you the content most relevant to you.",
                        clickUrl: isLoggedIn(user) ? "/account" : undefined,
                        buttonText: "Set your preferences",
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: "Create student groups",
                        icon: {src: "/assets/cs/icons/group-cyan.svg"},
                        bodyText: "Organise your students into groups and set work appropriate for each group.",
                        clickUrl: isLoggedIn(user) ? "/groups" : undefined,
                        buttonText: "Create a group",
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: "Set assignments",
                        icon: {src: "/assets/cs/icons/file-cyan.svg"},
                        bodyText: "Create self-marking assignments for your students. There are over 1000 questions for you to choose from.",
                        clickUrl: isLoggedIn(user) ? "/quizzes/set" : undefined,
                        buttonText: "Set an assignment",
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: "Review your markbook",
                        icon: {src: "/assets/cs/icons/search-cyan.svg"},
                        bodyText: "Track student progress with a personal markbook to help pinpoint areas to work on.",
                        clickUrl: isLoggedIn(user) ? "/my_markbook" : undefined,
                        buttonText: "View markbook",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="cpd" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
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
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: "Teacher mentoring",
                        image: {src: "/assets/cs/decor/teacher-3.png"},
                        bodyText: "Get support through our online programme for newly qualified and non-specialist computer science teachers.",
                        clickUrl: "/pages/teacher_mentoring_2024",
                        buttonText: "Learn more",
                        className: "bg-cultured-grey",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="student-challenges" className="bg-cyan-200">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Student challenges</h2>
                        <p>Encourage and reward student success with our student challenge programme, designed to inspire achievement at every stage of their studies.</p>
                        <Button tag={Link} to={"/pages/student_challenges"}>Find out more</Button>
                    </TextBlock>
                    {featuredStudentChallengePod ? <IconCard card={{
                        title: featuredStudentChallengePod.title ?? "",
                        icon: {src: "/assets/cs/icons/lightbulb-cyan.svg"},
                        bodyText: featuredStudentChallengePod.value ?? "",
                        tag: featuredStudentChallengePod.subtitle ?? "",
                        clickUrl: featuredStudentChallengePod.url ?? "",
                        buttonText: "Read more",
                        buttonStyle: "link",
                    }}/> : <IconCard card={{
                        title: "There are no active challenges at the moment.",
                        icon: {src: "/assets/cs/icons/lightbulb-cyan.svg"},
                        bodyText: "Check back soon!",
                    }}/>}
                </ColumnSlice>
            </Container>
        </section>
        <section id="more-resources" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
                    <h2>More teaching resources</h2>
                    <p>Support, lesson plans, ideas, and tools from the Raspberry Pi Foundation&apos;s world-class range of computer science resources.</p>
                </TextBlock>
                <ColumnSlice>
                    <AdaCard card={{
                        title: "Research projects",
                        image: {src: "/assets/cs/decor/teacher-4.png"},
                        bodyText: "Discover groundbreaking research that advances the understanding of how people learn about computing. These projects are a collaboration between the Raspberry Pi Foundation and the University of Cambridge.",
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/research/projects",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: "Hello World magazine",
                        image: {src: "/assets/cs/decor/hello-world.png"},
                        bodyText: "Get a global perspective on computing education with Hello World – our magazine and podcast for educators. Share your expertise and write for us!",
                        buttonText: "Learn more",
                        clickUrl: "https://www.raspberrypi.org/hello-world",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: "Code Editor for Education",
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: "Our free code editor makes it easy for young people to learn text-based programming. It's safe, age-appropriate, and suitable for use in the classroom.",
                        buttonText: "Learn more",
                        clickUrl: "https://editor.raspberrypi.org/en/education",
                        className: "bg-cultured-grey",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="testimonial" className="bg-black">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        &ldquo;Ada Computer Science has eliminated the need for textbooks for A level computer science. There is rarely a need for any other sources of information when planning lessons and it&apos;s free!&rdquo;
                    </h2>
                    <p>– Matt Arnmor, computer science teacher</p>
                </TextBlock>
            </Container>
        </section>
        <section id="help-and-support" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="py-4 position-relative">
                    <img className="full-background-img border-radius-3 bg-dark-pink-300" src="/assets/cs/decor/help-slice-purple.svg" alt=""/>
                    <TextBlock className="py-3 text-center text-white">
                        <h3>Need help?</h3>
                        <p>Our teacher support page has lots of information for common questions and issues.</p>
                        <Button outline className="bg-white" to="/support/teacher/general" tag={Link}>Teacher support</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
