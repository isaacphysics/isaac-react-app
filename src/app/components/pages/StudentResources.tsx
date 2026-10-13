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
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

export const StudentResources = () => {
    const { t } = useTranslation();
    useEffect( () => {document.title = i18next.t("common:studentResources.pageTitle", { siteTitle: SITE_TITLE });}, []);
    const {data: studentChallengesPods} = useGetNewsPodListQuery({subject: "student_challenges"});
    const featuredStudentChallengePod = studentChallengesPods?.[0];
    
    const user = useAppSelector(selectors.user.orNull);

    return <div id="student-resources">
        <section id="resources-header" className="bg-cyan-200">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <Trans i18nKey="common:studentResources.header.title" components={{ decorativeSlash: <span className="text-yellow" />, br: <br /> }} />
                        </h1>
                        <p>{t("common:studentResources.header.description")}</p>
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
                        <h2>{t("common:studentResources.curriculum.title")}</h2>
                        <p>{t("common:studentResources.curriculum.description")}</p>
                        <p>{t("common:studentResources.curriculum.note")}</p>
                        <Button className="mt-3" tag={Link} to="/topics">{t("common:studentResources.curriculum.exploreButton")}</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="practice-questions">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock>
                        <h2>{t("common:studentResources.practiceQuestions.title")}</h2>
                        <p>{t("common:studentResources.practiceQuestions.description")}</p>
                        <Button className="mt-3" tag={Link} to="/questions">{t("common:studentResources.practiceQuestions.tryButton")}</Button>
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
                        <h2>{t("common:studentResources.progress.title")}</h2>
                        <p>{t("common:studentResources.progress.description")}</p>
                        {isLoggedIn(user) ? <>
                            <Button className="mt-3" tag={Link} to="/progress">{t("common:studentResources.progress.viewButton")}</Button>
                        </> : <>
                            <Button className="me-3" to={"/register"} tag={Link}>{t("common:button.createAccount")}</Button>
                            <Button color="keyline" to={"/login"} tag={Link}>{t("common:button.logIn")}</Button>
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
                        <h2>{t("common:studentResources.challenges.title")}</h2>
                        <p>{t("common:studentResources.challenges.description")}</p>
                        <Button className="mt-3" tag={Link} to="/pages/student_challenges">{t("common:studentResources.challenges.learnMoreButton")}</Button>
                    </TextBlock>
                    {featuredStudentChallengePod ? <IconCard card={{
                        title: featuredStudentChallengePod.title ?? "",
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: featuredStudentChallengePod.value ?? "",
                        tag: featuredStudentChallengePod.subtitle ?? "",
                        clickUrl: featuredStudentChallengePod.url ?? "",
                        buttonText: t("common:button.readMore"),
                        buttonStyle: "link",
                    }}/> : <IconCard card={{
                        title: t("common:studentResources.challenges.emptyTitle"),
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: t("common:studentResources.challenges.emptyBody"),
                    }}/>}
                </ColumnSlice>
            </Container>
        </section>
        <section id="further-learning" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock>
                    <h2>{t("common:studentResources.furtherLearning.title")}</h2>
                    <p>{t("common:studentResources.furtherLearning.description")}</p> 
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t("common:studentResources.furtherLearning.projectsTitle"),
                        image: {src: "/assets/cs/decor/coding-projects.png"},
                        bodyText: t("common:studentResources.furtherLearning.projectsBody"),
                        buttonText: t("common:studentResources.furtherLearning.projectsButton"),
                        clickUrl: "https://projects.raspberrypi.org/en",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t("common:studentResources.furtherLearning.astroPiTitle"),
                        image: {src: "/assets/cs/decor/astro-pi.png"},
                        bodyText: t("common:studentResources.furtherLearning.astroPiBody"),
                        buttonText: t("common:studentResources.furtherLearning.astroPiButton"),
                        clickUrl: "https://astro-pi.org/",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t("common:studentResources.furtherLearning.codeEditorTitle"),
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: t("common:studentResources.furtherLearning.codeEditorBody"),
                        buttonText: t("common:studentResources.furtherLearning.codeEditorButton"),
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
                        <h2>{t("common:studentResources.isaacScience.title")}</h2>
                        <p>{t("common:studentResources.isaacScience.description")}</p>
                        <ExternalLink asButton href='https://isaacscience.org'>
                            {t("common:studentResources.isaacScience.visitButton")}
                        </ExternalLink>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="testimonial" className="bg-black">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <div className="h2">
                        {t("common:studentResources.testimonial.quote")}
                    </div>
                    <p>{t("common:studentResources.testimonial.attribution")}</p>
                </TextBlock>
            </Container>
        </section>
        <section id="careers">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock>
                    <h2>{t("common:studentResources.careers.title")}</h2>
                    <p>{t("common:studentResources.careers.description")}</p> 
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t("common:studentResources.careers.maxFordhamTitle"),
                        image: {src: "/assets/cs/decor/stories/max-fordham.png"},
                        bodyText: t("common:studentResources.careers.maxFordhamBody"),
                        buttonText: t("common:button.readMore"),
                        clickUrl: "/pages/20240730_max_fordham"
                    }}/>
                    <AdaCard card={{
                        title: t("common:studentResources.careers.meghnaAsthanaTitle"),
                        image: {src: "/assets/cs/decor/stories/meghna-asthana.png"},
                        bodyText: t("common:studentResources.careers.meghnaAsthanaBody"),
                        buttonText: t("common:button.readMore"),
                        clickUrl: "/pages/20240313_meghna_asthana"
                    }}/>
                    <AdaCard card={{
                        title: t("common:studentResources.careers.lellaHalloumTitle"),
                        image: {src: "/assets/cs/decor/stories/lella-halloum.png"},
                        bodyText: t("common:studentResources.careers.lellaHalloumBody"),
                        buttonText: t("common:button.readMore"),
                        clickUrl: "/pages/20240215_lella_halloum"
                    }}/>
                </ColumnSlice>
                <div className="d-flex justify-content-center mt-6">
                    <Link to="/pages/computer_science_stories" target="_blank">
                        <strong className="link-dark-pink">{t("common:studentResources.careers.viewMoreButton")}</strong>
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
                        <div className="h3">{t("common:studentResources.support.title")}</div>
                        <p>{t("common:studentResources.support.description")}</p>
                        <Button to="/support/student/general" tag={Link}>{t("common:studentResources.support.button")}</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
