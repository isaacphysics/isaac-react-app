import React from "react";
import {PageTitle} from "../elements/PageTitle";
import {Container} from "reactstrap";
import {ColumnSlice} from "../elements/layout/ColumnSlice";
import {IconCard} from "../elements/cards/IconCard";
import { useTeacherOnboardingModal } from "../elements/modals/AdaTeacherOnboardingModal";
import { GetStartedWithAda } from "../elements/panels/GetStartedWithAda";
import { AdaNewsSection } from "../elements/AdaNewsSection";

export const Overview = () => {
    useTeacherOnboardingModal();    

    return <div id={"overview"}>
        <section id="get-started">
            <Container className="overview-padding mw-1600">
                <div id={"page-title"} className={"py-3"}>
                    <PageTitle currentPageTitle={"Overview"} />
                </div>
                <GetStartedWithAda />
            </Container>
        </section>
        <section id="browse">
            <Container className="overview-padding mw-1600">
                <h2>Browse Ada CS</h2>
                <ColumnSlice className={"row-cols-lg-4 row-cols-md-2"}>
                    <IconCard className={"without-margin"} card={{
                        title: "Student groups",
                        icon: {name: "icon-group", color: "secondary"},
                        bodyText: "Organise your students into groups so you can set appropriate work.",
                        clickUrl: "/groups",
                        buttonText: "Manage groups",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Quizzes",
                        icon: {name: "icon-file", color: "secondary"},
                        bodyText: "Create self-marking quizzes and assign them to your students.",
                        clickUrl: "/quizzes/set",
                        buttonText: "Assign a quiz",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Tests",
                        icon: {name: "icon-school", color:"secondary"},
                        bodyText: "Set a test curated by the Ada Computer Science team.",
                        clickUrl: "/set_tests/",
                        buttonText: "Set a test",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Review your markbook",
                        icon: {name: "icon-done-all", color: "secondary"},
                        bodyText: "Track student progress and pinpoint areas to work on.",
                        clickUrl: "/my_markbook",
                        buttonText: "View markbook",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Assigned to me",
                        icon: {name: "icon-person-check", color: "secondary"},
                        bodyText: "If you join a group for your development, this is where you’ll find quizzes assigned to you.",
                        clickUrl: "/assignments",
                        buttonText: "Work for you",
                        buttonStyle: "link",
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Account",
                        icon: {name: "icon-settings", color: "secondary"},
                        bodyText: "Manage all aspects of your account, from content settings to notification preferences.",
                        clickUrl: "/account",
                        buttonText: "Account settings",
                        buttonStyle: "link"
                    }}/>
                    <IconCard className={"without-margin"} card={{
                        title: "Need help?",
                        icon: {name: "icon-help", color: "secondary"},
                        bodyText: "Our teacher support page has useful information for common questions and issues.",
                        clickUrl: "/support/teacher/general",
                        buttonText: "Teacher support",
                        buttonStyle: "link",
                    }}/>
                </ColumnSlice>
            </Container>
        </section>

        <section id="news">
            <AdaNewsSection />
        </section>
    </div>;
};
