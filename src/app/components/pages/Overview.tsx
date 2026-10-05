import React, { useState } from "react";
import {ColumnSlice} from "../elements/layout/ColumnSlice";
import {IconCard} from "../elements/cards/IconCard";
import { useTeacherOnboardingModal } from "../elements/modals/AdaTeacherOnboardingModal";
import { GetStartedWithAda } from "../elements/panels/GetStartedWithAda";
import { AdaNewsSection } from "../elements/AdaNewsSection";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isTutorOrAbove, siteSpecific, UserNotification, useUserNotifications } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { AdaNotification } from "../elements/Notification";
import { CollapsibleContainer } from "../elements/CollapsibleContainer";
import { useTranslation } from "react-i18next";

export const Overview = () => {
    const user = useAppSelector(selectors.user.orNull);
    // Ada doesn't support tutors, but we use them in tests; using isTutorOrAbove is for consistency: https://github.com/isaacphysics/isaac-react-app/pull/2026#discussion_r2976393189
    return isTutorOrAbove(user) ? <TeacherOverview /> : <StudentOverview />;
};

const Notifications = ({notifications}: {notifications: UserNotification[]}) => {
    const { t } = useTranslation();
    const [expandNotifications, setExpandNotifications] = useState(false);

    return <>
        {notifications.slice(0, 3).map(notification => <AdaNotification key={notification.id} notification={notification} />)}
        <CollapsibleContainer expanded={expandNotifications} additionalOffset={"1rem"}>
            {notifications.slice(3).map(notification => <AdaNotification key={notification.id} notification={notification} />)}
        </CollapsibleContainer>
        <div className="text-center">
            {notifications.length > 3 && <button className="btn btn-link" onClick={() => setExpandNotifications(e => !e)}>
                {expandNotifications ? t("common:notifications.toggle.collapseButton") : t("common:notifications.toggle.expandButton", { count: notifications.length })}
            </button>}
        </div>
    </>;
};

export const TeacherOverview = () => {
    const { t } = useTranslation();
    useTeacherOnboardingModal();
    const {notifications, workCounts} = useUserNotifications();

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:overview.page.title")} />
        }
        sidebar={siteSpecific(
            undefined,
            <MyAdaSidebar />
        )}
        id="overview"
    >
        <section id="notifications" className="py-3">
            <Notifications notifications={notifications} />
        </section>
        <section id="get-started" className="py-3">
            <GetStartedWithAda />
        </section>
        <section id="browse" className="py-3">
            <h2>{t("common:overview.browse.sectionTitle")}</h2>
            <ColumnSlice className={"row-cols-lg-4 row-cols-md-2"}>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.groups.title"),
                    icon: {name: "icon-group", color: "secondary"},
                    bodyText: t("common:overview.teacher.groups.description"),
                    clickUrl: "/groups",
                    buttonText: t("common:overview.teacher.groups.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.quizzes.title"),
                    icon: {name: "icon-file", color: "secondary"},
                    bodyText: t("common:overview.teacher.quizzes.description"),
                    clickUrl: "/quizzes/set",
                    buttonText: t("common:overview.teacher.quizzes.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.tests.title"),
                    icon: {name: "icon-school", color:"secondary"},
                    bodyText: t("common:overview.teacher.tests.description"),
                    clickUrl: "/set_tests",
                    buttonText: t("common:overview.teacher.tests.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.markbook.title"),
                    icon: {name: "icon-done-all", color: "secondary"},
                    bodyText: t("common:overview.teacher.markbook.description"),
                    clickUrl: "/my_markbook",
                    buttonText: t("common:overview.teacher.markbook.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.assigned.title"),
                    icon: {name: "icon-person-check", color: "secondary"},
                    tag: workCounts.assignments > 0 ? `${workCounts.assignments} to do` : undefined,
                    bodyText: t("common:overview.teacher.assigned.description"),
                    clickUrl: "/assignments",
                    buttonText: t("common:overview.assigned.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.account.title"),
                    icon: {name: "icon-settings", color: "secondary"},
                    bodyText: t("common:overview.teacher.account.description"),
                    clickUrl: "/account",
                    buttonText: t("common:overview.teacher.account.buttonLabel"),
                    buttonStyle: "link"
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.mentoring.title"),
                    icon: {name: "icon-group", color: "secondary"},
                    bodyText: t("common:overview.teacher.mentoring.description"),
                    clickUrl: "/teacher_mentoring",
                    buttonText: t("common:button.learnMore"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.support.title"),
                    icon: {name: "icon-help", color: "secondary"},
                    bodyText: t("common:overview.teacher.support.description"),
                    clickUrl: "/support/teacher/general",
                    buttonText: t("common:overview.teacher.support.buttonLabel"),
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
    const { t } = useTranslation();
    const {notifications, workCounts} = useUserNotifications();

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:overview.page.title")} />
        }
        sidebar={siteSpecific(
            undefined,
            <MyAdaSidebar />
        )}
        id="overview"
    >
        <section id="notifications" className="py-3">
            <Notifications notifications={notifications} />
        </section>
        <section id="browse" className="py-3">
            <h2>{t("common:overview.browse.sectionTitle")}</h2>
            <ColumnSlice className={"row-cols-lg-4 row-cols-md-2 mt-3"}>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.assigned.title"),
                    icon: {name: "icon-person-check", color: "secondary"},
                    tag: workCounts.assignments > 0 ? `${workCounts.assignments} to do` : undefined,
                    bodyText: t("common:overview.student.assigned.description"),
                    clickUrl: "/assignments",
                    buttonText: t("common:overview.assigned.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.tests.title"),
                    icon: {name: "icon-school", color:"secondary"},
                    tag: workCounts.tests > 0 ? `${workCounts.tests} to do` : undefined,
                    bodyText: t("common:overview.student.tests.description"),
                    clickUrl: "/tests",
                    buttonText: t("common:overview.student.tests.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.student.progress.title"),
                    icon: {name: "icon-done-all", color: "secondary"},
                    bodyText: t("common:overview.student.progress.description"),
                    clickUrl: "/progress",
                    buttonText: t("common:overview.student.progress.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.teacher.account.title"),
                    icon: {name: "icon-settings", color: "secondary"},
                    bodyText: t("common:overview.teacher.account.description"),
                    clickUrl: "/account",
                    buttonText: t("common:overview.teacher.account.buttonLabel"),
                    buttonStyle: "link"
                }}/>
                {/* --- end of sidebar options --- */}
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.student.topics.title"),
                    icon: {name: "icon-lightbulb-empty", color: "secondary"},
                    bodyText: t("common:overview.student.topics.description"),
                    clickUrl: "/topics",
                    buttonText: t("common:overview.student.topics.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.student.questions.title"),
                    icon: {name: "icon-search", color: "secondary"},
                    bodyText: t("common:overview.student.questions.description"),
                    clickUrl: "/questions",
                    buttonText: t("common:overview.student.questions.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.student.projects.title"),
                    icon: {name: "icon-globe", color: "secondary"},
                    bodyText: t("common:overview.student.projects.description"),
                    clickUrl: "/projects",
                    buttonText: t("common:overview.student.projects.buttonLabel"),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t("common:overview.support.title"),
                    icon: {name: "icon-help", color: "secondary"},
                    bodyText: t("common:overview.student.support.description"),
                    clickUrl: "/support/student/general",
                    buttonText: t("common:overview.student.support.buttonLabel"),
                    buttonStyle: "link",
                }}/>
            </ColumnSlice>
        </section>
        
        <section id="news" className="py-3">
            <AdaNewsSection />
        </section>
    </PageContainer>;
};
