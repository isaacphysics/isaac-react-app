import React, { useEffect, useState } from "react";
import {PageTitle} from "../elements/PageTitle";
import {Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Container, Row} from "reactstrap";
import {ColumnSlice} from "../elements/layout/ColumnSlice";
import {IconCard} from "../elements/cards/IconCard";
import {useDeviceSize} from "../../services";
import {selectors, useAppSelector, useGetNewsPodListQuery} from "../../state";
import {useLinkableSetting} from "../../services/linkableSetting";
import {NewsCard} from "../elements/cards/NewsCard";
import { ProgressBar } from "../elements/views/ProgressBar";
import { useAdaGetStartedTasks } from "../../services/adaOnboardingTasks";
import { CompletableTask } from "../elements/CompletableTask";
import { ShowLoading } from "../handlers/ShowLoading";

export const Overview = () => {
    const {data: news} = useGetNewsPodListQuery({subject: "news"});
    const deviceSize = useDeviceSize();
    const userPreferences = useAppSelector(selectors.user.preferences);
    const showNewsletterPrompts = !userPreferences?.EMAIL_PREFERENCE?.NEWS_AND_UPDATES;
    const {setLinkedSetting} = useLinkableSetting();
    const [getStartedOpen, setGetStartedOpen] = useState(false);

    const getStartedTasks = useAdaGetStartedTasks();
    const percentComplete = getStartedTasks ? Math.round(100 * Object.values(getStartedTasks).filter(Boolean).length / Object.keys(getStartedTasks).length) : 0;

    useEffect(() => {
        if (getStartedTasks && !Object.values(getStartedTasks).every(Boolean)) {
            setGetStartedOpen(true);
        }
    }, [getStartedTasks]);

    return <div id={"overview"}>
        <section id="get-started">
            <Container className="overview-padding mw-1600">
                <div id={"page-title"} className={"py-3"}>
                    <PageTitle currentPageTitle={"Overview"} />
                </div>
                <Accordion open={getStartedOpen ? ["1"] : []} toggle={() => setGetStartedOpen(o => !o)} className="position-relative">
                    <AccordionItem>
                        <AccordionHeader targetId="1">
                            Get started with Ada CS
                        </AccordionHeader>
                        <AccordionBody accordionId="1">
                            <ShowLoading
                                until={getStartedTasks}
                                thenRender={(tasks) => <>
                                    Follow these steps to get started with your teacher account:

                                    <div className="d-flex align-items-center gap-4 mt-2">
                                        <span className="fw-bold">{percentComplete}%</span>
                                        <ProgressBar thin rounded percentage={percentComplete} type="ada-primary" />
                                    </div>

                                    <ul className="list-unstyled d-flex flex-column mt-3 gap-3">
                                        <CompletableTask tag={"li"} complete={tasks.createAccount}>
                                            <strong>Create your account</strong>
                                        </CompletableTask>

                                        <CompletableTask tag={"li"} complete={tasks.personaliseContent} disabled={!tasks.createAccount} action={{
                                            title: "Personalise your content",
                                            to: "/account#customise",
                                            onClick: () => setLinkedSetting("account-context")
                                        }}>
                                            <div className="d-flex flex-column">
                                                <h5 className="m-0">Personalise your content</h5>
                                                <span>Pick a teaching level and exam board, or choose to see all content.</span>
                                            </div>
                                        </CompletableTask>

                                        <CompletableTask tag={"li"} complete={tasks.createGroup} disabled={!tasks.createAccount} action={{
                                            title: "Manage groups",
                                            to: "/groups",
                                        }}>
                                            <strong>Create a student group</strong>
                                        </CompletableTask>

                                        <CompletableTask tag={"li"} complete={tasks.assignQuiz} disabled={!tasks.createGroup}>
                                            <strong>Assign a quiz to students</strong>
                                        </CompletableTask>

                                        {/* <CompletableTask tag={"li"} complete={tasks.viewMarkbook} disabled={!tasks.assignQuiz}>
                                            <strong>View your markbook</strong>
                                        </CompletableTask> */}
                                    </ul>  
                                </>}
                            />
                        </AccordionBody>
                    </AccordionItem>
                </Accordion>
            </Container>
        </section>
        <section id="browse">
            <Container className="overview-padding mw-1600">
                <h2>Browse Ada CS</h2>
                <ColumnSlice className={"row-cols-lg-4 row-cols-md-2"}>
                    <IconCard className={"without-margin"} card={{
                        title: "Student groups",
                        icon: {src: "/assets/cs/icons/group-cyan.svg"},
                        bodyText: "Organise your students into groups so you can set appropriate work.",
                        clickUrl: "/groups",
                        buttonText: "Manage groups",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Quizzes",
                        icon: {src: "/assets/cs/icons/file-cyan.svg"},
                        bodyText: "Create self-marking quizzes and assign them to your students.",
                        clickUrl: "/quizzes/set",
                        buttonText: "Assign a quiz",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Tests",
                        icon: {src: "/assets/cs/icons/school.svg"},
                        bodyText: "Set a test curated by the Ada Computer Science team.",
                        clickUrl: "/set_tests/",
                        buttonText: "Set a test",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Review your markbook",
                        icon: {src: "/assets/cs/icons/done_all.svg"},
                        bodyText: "Track student progress and pinpoint areas to work on.",
                        clickUrl: "/my_markbook",
                        buttonText: "View markbook",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Assigned to me",
                        icon: {src: "/assets/cs/icons/person_check.svg"},
                        bodyText: "If you join a group for your development, this is where you’ll find quizzes assigned to you.",
                        clickUrl: "/assignments",
                        buttonText: "Work for you",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Account",
                        icon: {src: "/assets/cs/icons/settings.svg"},
                        bodyText: "Manage all aspects of your account, from content settings to notification preferences.",
                        clickUrl: "/account",
                        buttonText: "Account settings",
                        buttonStyle: "link"
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Need help?",
                        icon: {src: "/assets/cs/icons/help-cyan.svg"},
                        bodyText: "Our teacher support page has useful information for common questions and issues.",
                        clickUrl: "/support/teacher/general",
                        buttonText: "Teacher support",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>

        <section id="news">
            <Container className="overview-padding mw-1600">
                {news && news.length > 0 && <>
                    <h2>News</h2>
                    <Row xs={12}
                        className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around my-3">
                        {news.slice(0, deviceSize === "lg" ? 3 : 4).map((n, i) => <NewsCard key={i} newsItem={n}
                            showTitle
                            cardClassName="bg-cultured-grey"/>)}
                    </Row>
                    <div className={"mt-4 mt-lg-7 w-100 text-center"}>
                        <Button href={"/news"} color={"link"}><h4 className={"mb-0"}>See more news</h4></Button>
                    </div>
                </>}
            </Container>
        </section>

        <section id="newsletter">
            <Container className="overview-padding mw-1600">
                {showNewsletterPrompts &&
                    <Row xs={12} className="mt-3">
                        <IconCard
                            card={{
                                title: "Stay updated",
                                icon: {src: "/assets/cs/icons/mail.svg"},
                                bodyText: "Update your preferences and be the first to hear about new features, challenges, topics, and improvements on the platform.",
                                clickUrl: "/account#notifications",
                                buttonText: "Join our newsletter",
                                onButtonClick: () => {
                                    setLinkedSetting("news-preference");
                                }
                            }}
                        />
                    </Row>
                }
            </Container>
        </section>
    </div>;
};
