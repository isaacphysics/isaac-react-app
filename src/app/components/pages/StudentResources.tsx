import React from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { TextBlock } from "../elements/layout/TextBlock";
import { IconCard } from "../elements/cards/IconCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { isLoggedIn } from "../../services";

export const StudentResources = () => {
    const {data: studentPods} = useGetNewsPodListQuery({subject: "news"});
    const featuredPod = studentPods?.[0];
    const user = useAppSelector(selectors.user.orNull);

    return <div id="student-resources">
        <section id="resources-header" className="bg-cyan-200">
            <Container className="py-5 homepage-x-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <span className="text-yellow">/</span><br/>
                            Resources for students
                        </h1>
                        <p>We&apos;ve got everything to help you study computer science – including classwork, homework, and exam prep. And it&apos;s all available for free.</p>
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/learner-1.png" alt=""/>
                    </ImageBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="updates">
            <Container className="py-5 homepage-x-padding mw-1600 position-relative" fluid>
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
        <section id="curriculum">
            <Container className="py-5 homepage-x-padding mw-1600 bg-white" fluid>
                <ColumnSlice>
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
            <Container className="py-5 homepage-x-padding mw-1600" fluid>
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
        <section id="progress">
            <Container className="py-5 homepage-x-padding mw-1600 bg-white" fluid>
                <ColumnSlice>
                    <ImageBlock>
                        <img className="px-md-2 px-xl-4" src="/assets/cs/decor/progress.svg" alt=""/>
                    </ImageBlock>
                    <TextBlock>
                        <h2>Track your progress</h2>
                        <p>With an Ada account, all your answers get saved so you can see what to work on and how you’re progressing. And you can track any assignments set by your teacher.</p>
                        {isLoggedIn(user) ? <>
                            <Button className="mt-3" tag={Link} to="/progress">View my progress</Button>
                        </> : <>
                            <Button className="me-3" to={"/register"} tag={Link}>Create an account</Button>
                            <Button outline to={"/login"} tag={Link}>Log in</Button>
                        </>}
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="student-challenges">
            <Container className="py-5 homepage-x-padding mw-1600 position-relative" fluid>
                <img className="full-background-img bg-cyan-200" src="/assets/cs/decor/slice-bg-1.svg" alt=""/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Win prizes with our student challenges</h2>
                        <p>Join one of our termly challenges. Test your knowledge and skills, and be in with the chance to win some great prizes.</p>
                        <Button className="mt-3" tag={Link} to="/pages/student_challenges">Find out more</Button>
                    </TextBlock>
                    {/* TODO: this is currently hard-coded because challenges aren't retrievable via an API call */}
                    <IconCard card={{
                        title: "Enigma challenge",
                        icon: {src: "/assets/cs/icons/lightbulb-cyan.svg"},
                        bodyText: "Join the Enigma Challenge now to prepare for stage 1 of this year's exciting competition!",
                        tag: "Starting 1st October",
                        clickUrl: "/pages/student_challenges",
                        buttonText: "Read more",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="further-learning">
            <Container className="py-5 homepage-x-padding mw-1600 bg-white" fluid>
                <TextBlock>
                    <h2>Further learning</h2>
                    <p>More projects, challenges, and tools from the Raspberry Pi Foundation’s world class range of computer science resources.</p> 
                </TextBlock>
                <ColumnSlice>
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
        <section id="testimonial">
            <Container className="py-5 homepage-x-padding mw-1600 bg-black" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        &ldquo;I love Ada! The content featured is very comprehensive and detailed, and the visual guides through topics like sorts are particularly helpful to aid my understanding.&rdquo;
                    </h2>
                    <p>– Computer science student</p>
                </TextBlock>
            </Container>
        </section>
        <section id="careers">
            <Container className="py-5 homepage-x-padding mw-1600" fluid>
                <TextBlock>
                    <h2>Explore a career in computer science</h2>
                    <p>Read stories from graduates at the early stages of their careers in software development, game design, research, and much more.</p> 
                </TextBlock>
                <ColumnSlice>
                    <AdaCard card={{
                        title: "Max Fordham",
                        image: {src: "https://adacomputerscience.org/images/content/news/pods/figures/ada_cs_max_f_pod.png"},
                        bodyText: "Explore how Max’s passion for computer science led him to become a software engineer through a digital technology solutions apprenticeship.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240730_max_fordham"
                    }}/>
                    <AdaCard card={{
                        title: "Meghna Asthana",
                        image: {src: "https://adacomputerscience.org/images/content/news/pods/figures/ada_cs_meghna_a_pod.png"},
                        bodyText: "Discover how Meghna turned her passion for coding into a career in computer vision, where she now works on innovative projects addressing environmental challenges.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240313_meghan_asthana"
                    }}/>
                    <AdaCard card={{
                        title: "Lella Halloum",
                        image: {src: "https://adacomputerscience.org/images/content/news/pods/figures/ada_cs_lella_h_pod.png"},
                        bodyText: "Meet Lella, a young digital changemaker who uses technology to inspire, engage, and upskill the next generation of talent.",
                        buttonText: "Read more",
                        clickUrl: "/pages/20240215_lella_halloum"
                    }}/>
                </ColumnSlice>
                <div className="d-flex justify-content-center mt-3">
                    <Link to="" target="_blank">
                        <strong className="link-dark-pink">View more stories</strong>
                    </Link>
                    <strong className="link-dark-pink">&gt;</strong>
                </div>
            </Container>
        </section>
        <section id="help-and-support">
            <Container className="py-5 homepage-x-padding mw-1600 bg-white" fluid>
                <div className="py-4 position-relative">
                    <img className="full-background-img border-radius-3 bg-cyan-200" src="/assets/cs/decor/help-slice-cyan.svg" alt=""/>
                    <TextBlock className="py-3 text-center">
                        <h3>Need help?</h3>
                        <p>Our student support page has lots of information for common questions and issues.</p>
                        <Button to="/support" tag={Link}>Student support</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
