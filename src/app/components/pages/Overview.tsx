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
import { useTranslation } from 'react-i18next'

export const Overview = () => {
    const user = useAppSelector(selectors.user.orNull);
    // Ada doesn't support tutors, but we use them in tests; using isTutorOrAbove is for consistency: https://github.com/isaacphysics/isaac-react-app/pull/2026#discussion_r2976393189
    return isTutorOrAbove(user) ? <TeacherOverview /> : <StudentOverview />;
};

const Notifications = ({notifications}: {notifications: UserNotification[]}) => {
    const { t } = useTranslation()
    const [expandNotifications, setExpandNotifications] = useState(false);

    return <>
        {notifications.slice(0, 3).map(notification => <AdaNotification key={notification.id} notification={notification} />)}
        <CollapsibleContainer expanded={expandNotifications} additionalOffset={"1rem"}>
            {notifications.slice(3).map(notification => <AdaNotification key={notification.id} notification={notification} />)}
        </CollapsibleContainer>
        <div className="text-center">
            {notifications.length > 3 && <button className="btn btn-link" onClick={() => setExpandNotifications(e => !e)}>
                {expandNotifications ? t('showFewerNotifications', 'Show fewer notifications') : t('showAllLengthNotifications', 'Show all {{length}} notifications', { length: notifications.length })}
            </button>}
        </div>
    </>;
};

export const TeacherOverview = () => {
    const { t } = useTranslation()
    useTeacherOnboardingModal();
    const {notifications, workCounts} = useUserNotifications();

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
        <section id="notifications" className="py-3">
            <Notifications notifications={notifications} />
        </section>
        <section id="get-started" className="py-3">
            <GetStartedWithAda />
        </section>
        <section id="browse" className="py-3">
            <h2>{t('browseAdaCs', 'Browse Ada CS')}</h2>
            <ColumnSlice className={"row-cols-lg-4 row-cols-md-2"}>
                <IconCard className={"without-margin"} card={{
                    title: t('studentGroups', 'Student groups'),
                    icon: {name: "icon-group", color: "secondary"},
                    bodyText: t('organiseYourStudentsIntoGroupsSoYouCanSetAppropriateWork', 'Organise your students into groups so you can set appropriate work.'),
                    clickUrl: "/groups",
                    buttonText: "Manage groups",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('quizzes', 'Quizzes'),
                    icon: {name: "icon-file", color: "secondary"},
                    bodyText: t('createSelfmarkingQuizzesAndAssignThemToYourStudents', 'Create self-marking quizzes and assign them to your students.'),
                    clickUrl: "/quizzes/set",
                    buttonText: t('assignAQuiz', 'Assign a quiz'),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('tests', 'Tests'),
                    icon: {name: "icon-school", color:"secondary"},
                    bodyText: t('setATestCuratedByTheAdaComputerScienceTeam', 'Set a test curated by the Ada Computer Science team.'),
                    clickUrl: "/set_tests",
                    buttonText: t('setATest', 'Set a test'),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('reviewYourMarkbook', 'Review your markbook'),
                    icon: {name: "icon-done-all", color: "secondary"},
                    bodyText: t('trackStudentProgressAndPinpointAreasToWorkOn', 'Track student progress and pinpoint areas to work on.'),
                    clickUrl: "/my_markbook",
                    buttonText: "View markbook",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('assignedToMe', 'Assigned to me'),
                    icon: {name: "icon-person-check", color: "secondary"},
                    tag: workCounts.assignments > 0 ? t('assignmentsToDo', '{{assignments}} to do', { assignments: workCounts.assignments }) : undefined,
                    bodyText: t('ifYouJoinAGroupForYourDevelopmentThisIsWhereYoullFindQuizzesAssignedToYou', 'If you join a group for your development, this is where you’ll find quizzes assigned to you.'),
                    clickUrl: "/assignments",
                    buttonText: t('workForYou', 'Work for you'),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('account', 'Account'),
                    icon: {name: "icon-settings", color: "secondary"},
                    bodyText: t('manageAllAspectsOfYourAccountFromContentSettingsToNotificationPreferences', 'Manage all aspects of your account, from content settings to notification preferences.'),
                    clickUrl: "/account",
                    buttonText: t('accountSettings2', 'Account settings'),
                    buttonStyle: "link"
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('teacherMentoring', 'Teacher mentoring'),
                    icon: {name: "icon-group", color: "secondary"},
                    bodyText: t('participateInLiveSessionsWithAnExperiencedAdaCsMentorToGetAdviceOnTeachingCoreTopics', 'Participate in live sessions with an experienced Ada CS mentor to get advice on teaching core topics.'),
                    clickUrl: "/teacher_mentoring",
                    buttonText: "Learn more",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('needHelp', 'Need help?'),
                    icon: {name: "icon-help", color: "secondary"},
                    bodyText: t('ourTeacherSupportPageHasUsefulInformationForCommonQuestionsAndIssues', 'Our teacher support page has useful information for common questions and issues.'),
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
    const { t } = useTranslation()
    const {notifications, workCounts} = useUserNotifications();

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
        <section id="notifications" className="py-3">
            <Notifications notifications={notifications} />
        </section>
        <section id="browse" className="py-3">
            <h2>{t('browseAdaCs', 'Browse Ada CS')}</h2>
            <ColumnSlice className={"row-cols-lg-4 row-cols-md-2 mt-3"}>
                <IconCard className={"without-margin"} card={{
                    title: t('assignedToMe', 'Assigned to me'),
                    icon: {name: "icon-person-check", color: "secondary"},
                    tag: workCounts.assignments > 0 ? t('assignmentsToDo', '{{assignments}} to do', { assignments: workCounts.assignments }) : undefined,
                    bodyText: t('thisIsWhereYoullFindAssignmentsThatHaveBeenAssignedToYou', 'This is where you’ll find assignments that have been assigned to you.'),
                    clickUrl: "/assignments",
                    buttonText: t('workForYou', 'Work for you'),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('tests', 'Tests'),
                    icon: {name: "icon-school", color:"secondary"},
                    tag: workCounts.tests > 0 ? t('testsToDo', '{{tests}} to do', { tests: workCounts.tests }) : undefined,
                    bodyText: t('thisIsWhereYoullFindTestsThatHaveBeenSetForYou', 'This is where you’ll find tests that have been set for you.'),
                    clickUrl: "/tests",
                    buttonText: "View tests",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('myProgress', 'My progress'),
                    icon: {name: "icon-done-all", color: "secondary"},
                    bodyText: t('trackYourProgressOverTimeAndPinpointAreasToWorkOn', 'Track your progress over time and pinpoint areas to work on.'),
                    clickUrl: "/progress",
                    buttonText: "View progress",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('account', 'Account'),
                    icon: {name: "icon-settings", color: "secondary"},
                    bodyText: t('manageAllAspectsOfYourAccountFromContentSettingsToNotificationPreferences', 'Manage all aspects of your account, from content settings to notification preferences.'),
                    clickUrl: "/account",
                    buttonText: t('accountSettings2', 'Account settings'),
                    buttonStyle: "link"
                }}/>
                {/* --- end of sidebar options --- */}
                <IconCard className={"without-margin"} card={{
                    title: t('topics', 'Topics'),
                    icon: {name: "icon-lightbulb-empty", color: "secondary"},
                    bodyText: t('browseAllTheTopicsInAdaCs', 'Browse all the topics in Ada CS.'),
                    clickUrl: "/topics",
                    buttonText: "Browse topics",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('questions', 'Questions'),
                    icon: {name: "icon-search", color: "secondary"},
                    bodyText: t('exploreOurQuestionBankToFindQuestionsToPracticeOnAnyTopic', 'Explore our question bank to find questions to practice on any topic.'),
                    clickUrl: "/questions",
                    buttonText: t('findQuestions', 'Find questions'),
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('projects', 'Projects'),
                    icon: {name: "icon-globe", color: "secondary"},
                    bodyText: t('takeOnLargerscaleProjectsToDevelopYourSkillsInAPracticalContext', 'Take on larger-scale projects to develop your skills in a practical context.'),
                    clickUrl: "/projects",
                    buttonText: "Browse projects",
                    buttonStyle: "link",
                }}/>
                <IconCard className={"without-margin"} card={{
                    title: t('needHelp', 'Need help?'),
                    icon: {name: "icon-help", color: "secondary"},
                    bodyText: t('ourStudentSupportPageHasUsefulInformationForCommonQuestionsAndIssues', 'Our student support page has useful information for common questions and issues.'),
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
