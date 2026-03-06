import React from "react";
import {ColumnSlice} from "../elements/layout/ColumnSlice";
import {IconCard} from "../elements/cards/IconCard";
import { useTeacherOnboardingModal } from "../elements/modals/AdaTeacherOnboardingModal";
import { GetStartedWithAda } from "../elements/panels/GetStartedWithAda";
import { AdaNewsSection } from "../elements/AdaNewsSection";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isTeacherOrAbove, siteSpecific } from "../../services";
import { FeatureFlag, useFeatureFlag } from "../../services/featureFlag";
import classNames from "classnames";
import { selectors, useAppSelector } from "../../state";

export const Overview = () => {
    const user = useAppSelector(selectors.user.orNull);
    return isTeacherOrAbove(user) ? <TeacherOverview /> : <StudentOverview />;
};

export const TeacherOverview = () => {
    useTeacherOnboardingModal();   
    const useAdaSidebars = useFeatureFlag(FeatureFlag.ENABLE_ADA_SIDEBARS); 

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={"Overview"} />
        }
        sidebar={siteSpecific(
            undefined,
            <MyAdaSidebar />
        )}
        id="overview"
        className={classNames({"overview-padding mw-1600": !useAdaSidebars})}
    >
        <section id="get-started" className="py-3">
            <GetStartedWithAda />
        </section>
        <section id="browse" className="py-3">
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
                    clickUrl: "/set_tests",
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
        </section>

        <section id="news" className="py-3">
            <AdaNewsSection />
        </section>
    </PageContainer>;
};

export const StudentOverview = () => {
    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={"Overview"} />
        }
        sidebar={siteSpecific(
            undefined,
            <MyAdaSidebar />
        )}
        id="overview"
    >
        <section id="browse" className="py-3">
            <h2>Browse Ada CS</h2>
            <ColumnSlice className={"row-cols-lg-4 row-cols-md-2"}>
                <IconCard className={"without-margin"} card={{
                    title: "Assigned to me",
                    icon: {name: "icon-person-check", color: "secondary"},
                    bodyText: "This is where you’ll find assignments that have been assigned to you.",
                    clickUrl: "/assignments",
                    buttonText: "Work for you",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: "Tests",
                    icon: {name: "icon-school", color:"secondary"},
                    bodyText: "This is where you’ll find tests that have been set for you.",
                    clickUrl: "/tests",
                    buttonText: "View tests",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: "My progress",
                    icon: {name: "icon-done-all", color: "secondary"},
                    bodyText: "Track your progress over time and pinpoint areas to work on.",
                    clickUrl: "/progress",
                    buttonText: "View progress",
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
                {/* --- end of sidebar options --- */}
                <IconCard className={"without-margin"} card={{
                    title: "Topics",
                    icon: {name: "icon-lightbulb-empty", color: "secondary"},
                    bodyText: "Browse all the topics in Ada CS.",
                    clickUrl: "/topics",
                    buttonText: "Browse topics",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: "Questions",
                    icon: {name: "icon-search", color: "secondary"},
                    bodyText: "Explore our question bank to find questions to practice on any topic.",
                    clickUrl: "/questions",
                    buttonText: "Find questions",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: "Projects",
                    icon: {name: "icon-globe", color: "secondary"},
                    bodyText: "Take on larger-scale projects to develop your skills in a practical context.",
                    clickUrl: "/projects",
                    buttonText: "Browse projects",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: "Need help?",
                    icon: {name: "icon-help", color: "secondary"},
                    bodyText: "Our student support page has useful information for common questions and issues.",
                    clickUrl: "/support/student/general",
                    buttonText: "Student support",
                    buttonStyle: "link",
                }}/>
            </ColumnSlice>
        </section>
        
        <section id="news" className="py-3">
            <AdaNewsSection />
        </section>
    </PageContainer>;
};
