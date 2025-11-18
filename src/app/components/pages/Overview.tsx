import React from "react";
import {ColumnSlice} from "../elements/layout/ColumnSlice";
import {IconCard} from "../elements/cards/IconCard";
import { useTeacherOnboardingModal } from "../elements/modals/AdaTeacherOnboardingModal";
import { GetStartedWithAda } from "../elements/panels/GetStartedWithAda";
import { AdaNewsSection } from "../elements/AdaNewsSection";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { PageTitle } from "../elements/PageTitle";

export const Overview = () => {
    useTeacherOnboardingModal();    

    return <PageContainer
        pageTitle={<PageTitle currentPageTitle={"Overview"} />}
        sidebar={<MyAdaSidebar />}
        className="overview-padding mw-1600"
    >
        <section id="get-started" className="py-3">
            <GetStartedWithAda />
        </section>
        <section id="browse" className="py-3">
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
                    clickUrl: "/set_tests",
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
        </section>

        <section id="news" className="py-3">
            <AdaNewsSection />
        </section>
    </PageContainer>;
};
