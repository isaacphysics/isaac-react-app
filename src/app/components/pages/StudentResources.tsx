import React, { useEffect } from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { TextBlock } from "../elements/layout/TextBlock";
import { IconCard } from "../elements/cards/IconCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { isLoggedIn, SITE_TITLE } from "../../services";
import { ExternalLink } from "../elements/ExternalLink";

export const StudentResources = () => {
    useEffect( () => {document.title = "Students — " + SITE_TITLE;}, []);
    const {data: studentChallengesPods} = useGetNewsPodListQuery({subject: "student_challenges"});
    const featuredStudentChallengePod = studentChallengesPods?.[0];
    
    const user = useAppSelector(selectors.user.orNull);

    return <div id="student-resources">
        <section id="resources-header" className="bg-cyan-200">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <span className="text-yellow">/</span><br/>
                            Ada CS for students
                        </h1>
                        <p>We&apos;ve got everything to help you study computer science – including classwork, homework, and exam prep. And it&apos;s all available for free.</p>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/learner-1-wide.png" alt=""/>
                    </ImageBlock>
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
                        <p>We have over 65 learning topics that cover everything you need to learn in computer science. From computing systems and networks, to AI, machine learning, and much more.</p>
                        <p>They&apos;re created by expert educators and are regularly updated.</p>
                        <Button className="mt-3" tag={Link} to="/topics">Explore all topics</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="practice-questions">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Over 1000 practice questions</h2>
                        <p>Our self-marking questions give you hints and instant feedback as you go. You can filter by exam level, topic, or concept to find exactly what you need.</p>
                        <Button className="mt-3" tag={Link} to="/questions">Try our practise questions</Button>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/question-finder-clean.svg" alt=""/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="progress" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice reverseUnderBreakpoint>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/progress.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>Track your progress</h2>
                        <p>With an Ada CS account, all your answers get saved so you can see what to work on and how you’re progressing. And you can track any assignments set by your teacher.</p>
                        {isLoggedIn(user) ? <>
                            <Button className="mt-3" tag={Link} to="/progress">View my progress</Button>
                        </> : <>
                            <Button className="me-3" to={"/register"} tag={Link}>Create an account</Button>
                            <Button color="keyline" to={"/login"} tag={Link}>Log in</Button>
                        </>}
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="student-challenges" className="bg-cyan-200">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Win prizes with our student challenges</h2>
                        <p>Join one of our termly challenges. Test your knowledge and skills, and be in with the chance to win some great prizes.</p>
                        <Button className="mt-3" tag={Link} to="/pages/student_challenges">Find out more</Button>
                    </TextBlock>
                    {featuredStudentChallengePod ? <IconCard card={{
                        title: featuredStudentChallengePod.title ?? "",
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: featuredStudentChallengePod.value ?? "",
                        tag: featuredStudentChallengePod.subtitle ?? "",
                        clickUrl: featuredStudentChallengePod.url ?? "",
                        buttonText: "Read more",
                        buttonStyle: "link",
                    }}/> : <IconCard card={{
                        title: "There are no active challenges at the moment.",
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: "Check back soon!",
                    }}/>}
                </ColumnSlice>
            </Container>
        </section>
        <section id="further-learning" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock>
                    <h2>Further learning</h2>
                    <p>More projects, challenges, and tools from the Raspberry Pi Foundation’s world class range of computer science resources.</p> 
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: "Online coding projects",
                        image: {src: "/assets/cs/decor/coding-projects.png"},
                        bodyText: "There are hundreds of free coding and computing projects, all with step-by-step instructions.",
                        buttonText: "Go to Projects",
                        clickUrl: "https://projects.raspberrypi.org/en",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: "Your code in space",
                        image: {src: "/assets/cs/decor/astro-pi.png"},
                        bodyText: "The European Astro Pi Challenge gets learners writing code that runs on the International Space Station.",
                        buttonText: "Go to Astro Pi",
                        clickUrl: "https://astro-pi.org/",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: "Free code editor",
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: "Our online code editor lets you code whatever you like: a game, some art, or your very own website using Python or HTML and CSS.",
                        buttonText: "Open the code editor",
                        clickUrl: "https://editor.raspberrypi.org/en/education",
                        className: "bg-cultured-grey",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="try-isaac">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/isaac-subject-logos.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>Studying science or maths?</h2>
                        <p>Check out Isaac Science, our partner platform packed with free tools and resources to help you learn physics, chemistry, biology and maths.</p>
                        <ExternalLink asButton href='https://isaacscience.org'>
                            Go to Isaac Science
                        </ExternalLink>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="testimonial" className="bg-black">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        &ldquo;I love Ada! The content featured is very comprehensive and detailed, and the visual guides through topics like sorts are particularly helpful to aid my understanding.&rdquo;
                    </h2>
                    <p>– Computer science student</p>
                </TextBlock>
            </Container>
        </section>
        <section id="careers">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock>
                    <h2>Explore a career in computer science</h2>
                    <p>Read stories from graduates at the early stages of their careers in software development, game design, research, and much more.</p> 
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: "Max Fordham",
                        image: {src: "/assets/cs/decor/stories/max-fordham.png"},
                        bodyText: "Explore how Max’s passion for computer science led him to become a software engineer through a digital technology solutions apprenticeship.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240730_max_fordham"
                    }}/>
                    <AdaCard card={{
                        title: "Meghna Asthana",
                        image: {src: "/assets/cs/decor/stories/meghna-asthana.png"},
                        bodyText: "Discover how Meghna turned her passion for coding into a career in computer vision, where she now works on innovative projects addressing environmental challenges.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240313_meghna_asthana"
                    }}/>
                    <AdaCard card={{
                        title: "Lella Halloum",
                        image: {src: "/assets/cs/decor/stories/lella-halloum.png"},
                        bodyText: "Meet Lella, a young digital changemaker who uses technology to inspire, engage, and upskill the next generation of talent.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240215_lella_halloum"
                    }}/>
                </ColumnSlice>
                <div className="d-flex justify-content-center mt-6">
                    <Link to="/pages/computer_science_stories" target="_blank">
                        <strong className="link-dark-pink">View more stories</strong>
                    </Link>
                    <strong className="link-dark-pink">&gt;</strong>
                </div>
            </Container>
        </section>
        <section id="help-and-support" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="py-4 position-relative">
                    <img className="full-background-img border-radius-3 bg-cyan-200" src="/assets/cs/decor/help-slice-cyan.svg" alt=""/>
                    <TextBlock className="py-3 text-center">
                        <h3>Need help?</h3>
                        <p>Our student support page has lots of information for common questions and issues.</p>
                        <Button to="/support/student/general" tag={Link}>Student support</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
