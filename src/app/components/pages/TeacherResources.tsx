import React, { useEffect } from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { IconCard } from "../elements/cards/IconCard";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { TextBlock } from "../elements/layout/TextBlock";
import { Link } from "react-router-dom";
import { AdaCard } from "../elements/cards/AdaCard";
import { isLoggedIn, isTeacherOrAbove, SITE_TITLE } from "../../services";
import { ImageBlock } from "../elements/layout/ImageBlock";
import classNames from "classnames";
import { ExternalLink } from "../elements/ExternalLink";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

export const TeacherResources = () => {
    const { t } = useTranslation();
    useEffect( () => {document.title = i18next.t("common:teacherResources.meta.title", { siteTitle: SITE_TITLE });}, []);
    const {data: studentChallengesPods} = useGetNewsPodListQuery({subject: "student_challenges"});
    const featuredStudentChallengePod = studentChallengesPods?.[0];

    const user = useAppSelector(selectors.user.orNull);
    return <div id="teacher-resources">
        <section id="resources-header" className="bg-dark-pink-200" aria-labelledby="resources-header-heading">
            <Container className="homepage-padding mw-1600" fluid>
                <ColumnSlice>
                    <TextBlock className="text-white">
                        <h1 id="resources-header-heading" className="font-size-1-75 font-size-md-2-5">
                            <Trans i18nKey="common:teacherResources.header.title" components={{ decorativeSlash: <span className="text-pink" />, br: <br /> }} />
                        </h1>
                        <p>
                            {t("common:teacherResources.header.description")}
                        </p>
                        {(!isLoggedIn(user) && <>
                            <Button color="keyline" className="bg-white" to="/register" tag={Link}>{t("common:teacherResources.header.signupButton")}</Button>    
                        </>) || isTeacherOrAbove(user) && <>
                            <Button color="keyline" className="bg-white" to="/dashboard" tag={Link}>{t("common:teacherResources.header.dashboardButton")}</Button>
                        </> || <>
                            <Button color="keyline" className="bg-white" to="/teacher_account_request" tag={Link}>{t("common:teacherResources.header.upgradeButton")}</Button>    
                        </>}
                    </TextBlock>
                    <ImageBlock>
                        <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-1-wide.png" alt=""  />
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
                        <h2>{t("common:teacherResources.curriculum.title")}</h2>
                        <p>{t("common:teacherResources.curriculum.description")}</p>
                        <p>{t("common:teacherResources.curriculum.descriptionTwo")}</p>
                        <Button tag={Link} to={"/topics"}>{t("common:teacherResources.curriculum.exploreButton")}</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="tools" aria-labelledby="tools-header">
            <Container className="homepage-padding mw-1600 position-relative" fluid>
                <img className="full-background-img" src="/assets/cs/decor/swirls.svg" alt=""/>
                <TextBlock md={8} className={classNames({"mb-3": !isLoggedIn(user)})}>
                    <h2 id="tools-header">{t("common:teacherResources.tools.title")}</h2>
                    <p>{t("common:teacherResources.tools.description")}</p>
                    <div className="pb-2 mb-3">
                        {(!isLoggedIn(user) && <> 
                            <Button className="me-3" to={"/register"} tag={Link}>{t("common:teacherResources.tools.createAccountButton")}</Button>
                            <Button color="keyline" to={"/login"} tag={Link}>{t("common:teacherResources.tools.loginButton")}</Button>
                        </>) || (isTeacherOrAbove(user) && <>
                            <Button to={"/dashboard"} tag={Link}>{t("common:teacherResources.tools.dashboardButton")}</Button>
                        </>) || <>
                            <Button to={"/teacher_account_request"} tag={Link}>{t("common:teacherResources.tools.upgradeButton")}</Button>
                        </>}
                    </div>
                </TextBlock>
                <ColumnSlice>
                    <IconCard card={{
                        title: t("common:teacherResources.tools.preferencesCard.title"),
                        icon: {name: "icon-tune", color: "secondary"},
                        bodyText: t("common:teacherResources.tools.preferencesCard.description"),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/account" : undefined,
                        buttonText: t("common:teacherResources.tools.preferencesCard.button"),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t("common:teacherResources.tools.groupsCard.title"),
                        icon: {name: "icon-group", color: "secondary"},
                        bodyText: t("common:teacherResources.tools.groupsCard.description"),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/groups" : undefined,
                        buttonText: t("common:teacherResources.tools.groupsCard.button"),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t("common:teacherResources.tools.assignmentsCard.title"),
                        icon: {name: "icon-file", color: "secondary"},
                        bodyText: t("common:teacherResources.tools.assignmentsCard.description"),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/quizzes/set" : undefined,
                        buttonText: t("common:teacherResources.tools.assignmentsCard.button"),
                        buttonStyle: "link",
                    }}/>
                    <IconCard card={{
                        title: t("common:teacherResources.tools.markbookCard.title"),
                        icon: {name: "icon-search", color: "secondary"},
                        bodyText: t("common:teacherResources.tools.markbookCard.description"),
                        clickUrl: isLoggedIn(user) && isTeacherOrAbove(user) ? "/my_markbook" : undefined,
                        buttonText: t("common:teacherResources.tools.markbookCard.button"),
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>
        <section id="testimonial" className="bg-black">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="backslash-left text-white">
                    <h2>
                        {t("common:teacherResources.testimonial.quote")}
                    </h2>
                    <p>{t("common:teacherResources.testimonial.attribution")}</p>
                </TextBlock>
            </Container>
        </section>
        <section id="cpd" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
                    <h2>{t("common:teacherResources.cpd.title")}</h2>
                    <p>{t("common:teacherResources.cpd.description")}</p>
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t("common:teacherResources.cpd.coursesCard.title"),
                        image: {src: "/assets/cs/decor/teacher-2.png"},
                        bodyText: t("common:teacherResources.cpd.coursesCard.description"),
                        clickUrl: "/pages/online_courses",
                        buttonText: t("common:teacherResources.cpd.coursesCard.button"),
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t("common:teacherResources.cpd.mentoringCard.title"),
                        image: {src: "/assets/cs/decor/teacher-3.png"},
                        bodyText: t("common:teacherResources.cpd.mentoringCard.description"),
                        clickUrl: "/teacher_mentoring",
                        buttonText: t("common:teacherResources.cpd.mentoringCard.button"),
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
                        <h2>{t("common:teacherResources.challenges.title")}</h2>
                        <p>{t("common:teacherResources.challenges.description")}</p>
                        <Button tag={Link} to={"/pages/student_challenges"}>{t("common:teacherResources.challenges.exploreButton")}</Button>
                    </TextBlock>
                    {featuredStudentChallengePod ? <IconCard card={{
                        title: featuredStudentChallengePod.title ?? "",
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: featuredStudentChallengePod.value ?? "",
                        tag: featuredStudentChallengePod.subtitle ?? "",
                        clickUrl: featuredStudentChallengePod.url ?? "",
                        buttonText: t("common:teacherResources.challenges.readMoreButton"),
                        buttonStyle: "link",
                    }}/> : <IconCard card={{
                        title: t("common:teacherResources.challenges.emptyState.title"),
                        icon: {name: "icon-lightbulb-empty", color: "secondary"},
                        bodyText: t("common:teacherResources.challenges.emptyState.description"),
                    }}/>}
                </ColumnSlice>
            </Container>
        </section>
        <section id="more-resources" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <TextBlock md={8}>
                    <h2>{t("common:teacherResources.moreResources.title")}</h2>
                    <p>{t("common:teacherResources.moreResources.description")}</p>
                </TextBlock>
                <ColumnSlice className="row-gap-5">
                    <AdaCard card={{
                        title: t("common:teacherResources.moreResources.researchCard.title"),
                        image: {src: "/assets/cs/decor/teacher-4.png"},
                        bodyText: t("common:teacherResources.moreResources.researchCard.description"),
                        buttonText: t("common:teacherResources.moreResources.researchCard.button"),
                        clickUrl: "https://www.raspberrypi.org/research/projects",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t("common:teacherResources.moreResources.helloWorldCard.title"),
                        image: {src: "/assets/cs/decor/hello-world.png"},
                        bodyText: t("common:teacherResources.moreResources.helloWorldCard.description"),
                        buttonText: t("common:teacherResources.moreResources.helloWorldCard.button"),
                        clickUrl: "https://www.raspberrypi.org/hello-world",
                        className: "bg-cultured-grey",
                    }}/>
                    <AdaCard card={{
                        title: t("common:teacherResources.moreResources.codeClassroomCard.title"),
                        image: {src: "/assets/cs/decor/code-editor.png"},
                        bodyText: t("common:teacherResources.moreResources.codeClassroomCard.description"),
                        buttonText: t("common:teacherResources.moreResources.codeClassroomCard.button"),
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
                        <h2>{t("common:teacherResources.tryIsaac.title")}</h2>
                        <p>{t("common:teacherResources.tryIsaac.description")}</p>
                        <ExternalLink asButton href='https://isaacscience.org'>
                            {t("common:teacherResources.tryIsaac.visitButton")}
                        </ExternalLink>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="help-and-support" className="bg-white">
            <Container className="homepage-padding mw-1600" fluid>
                <div className="py-4 position-relative">
                    <img className="full-background-img border-radius-3 bg-dark-pink-300" src="/assets/cs/decor/help-slice-purple.svg" alt=""/>
                    <TextBlock className="py-3 text-center text-white">
                        <h3>{t("common:teacherResources.help.title")}</h3>
                        <p>{t("common:teacherResources.help.description")}</p>
                        <Button color="keyline" className="bg-white" to="/support/teacher/general" tag={Link}>{t("common:teacherResources.help.supportButton")}</Button>
                    </TextBlock>
                </div>
            </Container>
        </section>
    </div>;
};
