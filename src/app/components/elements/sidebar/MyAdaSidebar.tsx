import React from "react";
import { ContentSidebar, ContentSidebarProps } from "../layout/SidebarLayout";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import classNames from "classnames";
import { selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../../../state";
import { above, below, isStudent, isTeacherOrAbove, isTutorOrAbove, useDeviceSize, useUserNotifications } from "../../../services";
import { Spacer } from "../Spacer";
import { useLocation } from "react-router";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

interface MyAdaTab {
    title: string;
    url: string;
    icon: string;
    user: "STUDENT" | "TUTOR" | "TEACHER" | "ALL"; // Which user roles can see this tab – n.b. teacher means teacherOrAbove
}

const MyAdaTabs: Record<string, MyAdaTab> = {
    overview: {
        title: i18next.t('overview', 'Overview'),
        url: "/dashboard",
        icon: "icon-home",
        user: "ALL"
    },
    groups: {
        title: i18next.t('groups', 'Groups'),
        url: "/groups",
        icon: "icon-group",
        user: "TUTOR"
    },
    setQuizzes: {
        title: i18next.t('quizzes', 'Quizzes'),
        url: "/quizzes/set",
        icon: "icon-file",
        user: "TUTOR"
    },
    setTests: {
        title: i18next.t('tests', 'Tests'),
        url: "/set_tests",
        icon: "icon-school",
        user: "TEACHER"
    },
    markbook: {
        title: i18next.t('markbook', 'Markbook'),
        url: "/my_markbook",
        icon: "icon-done-all",
        user: "TUTOR"
    },

    assignedToMe: {
        title: i18next.t('assignedToMe', 'Assigned to me'),
        url: "/assignments",
        icon: "icon-person-check",
        user: "ALL"
    },

    myTests: {
        title: i18next.t('tests', 'Tests'),
        url: "/tests",
        icon: "icon-school",
        user: "STUDENT"
    },
    progress: {
        title: i18next.t('progress', 'Progress'),
        url: "/progress",
        icon: "icon-done-all",
        user: "STUDENT"
    },

    account: {
        title: i18next.t('account', 'Account'),
        url: "/account",
        icon: "icon-cog",
        user: "ALL"
    }
};

interface AdaSidebarCollapserProps extends React.HTMLAttributes<HTMLButtonElement> {
    collapsed: boolean;
    toggleSidebar: () => void;
}

const AdaSidebarCollapser = ({collapsed, toggleSidebar, ...rest}: AdaSidebarCollapserProps) => {
    const { t } = useTranslation()
    return <button
        {...rest}
        type="button"
        className={classNames("bg-transparent d-flex justify-content-between align-items-center w-100 px-3 my-ada-tab", rest.className)}
        onClick={toggleSidebar}
    >
        <b>{t('myAda', 'My Ada')}</b>
        <Spacer />
        <i className={classNames("icon icon-md", collapsed ? "icon-chevron-right" : "icon-chevron-left")} aria-hidden="true" />
    </button>;
};


export const MyAdaSidebar = (props: ContentSidebarProps) => {
    const { t } = useTranslation()
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const deviceSize = useDeviceSize();

    const { notifications: _, workCounts } = useUserNotifications();

    const isOpen = useAppSelector(selectors.sidebar.open);
    const toggleSidebar = () => dispatch(sidebarSlice.actions.toggle());

    return <ContentSidebar {...props} className={classNames(props.className, {"collapsed": !isOpen})} buttonTitle="My Ada">
        <div className="sticky-top overflow-x-hidden">
            {above['md'](deviceSize) && <AdaSidebarCollapser collapsed={!isOpen} toggleSidebar={toggleSidebar} />}

            {Object.entries(MyAdaTabs)
                .filter(([_, tab]) => {
                    if (tab.user === "TEACHER") return isTeacherOrAbove(user);
                    if (tab.user === "TUTOR") return isTutorOrAbove(user);
                    if (tab.user === "STUDENT") return isStudent(user);
                    if (tab.user === "ALL") return true;
                    return false;
                }).map(([key, tab]) => {
                    const isActive = location.pathname === tab.url;
                    return <StyledTabPicker
                        key={key}
                        id={`tab-${tab.title.replace(" ", "-").toLowerCase()}`}
                        checkboxTitle={<div className={classNames("d-flex align-items-center gap-3")}>
                            <i className={classNames("icon icon-sm ms-1", tab.icon, {"icon-color-black": isActive && !isOpen})} aria-hidden="true" />
                            <b className="d-flex align-items-center gap-2">
                                {tab.title}
                                {((key === t('assignedtome', 'assignedToMe') && workCounts.assignments > 0) || (key === "myTests" && workCounts.tests > 0)) && <span 
                                    className="d-inline-block bg-primary active-dot"
                                />}
                            </b>
                        </div>}
                        checked={isActive}
                        className={classNames("nav-link my-ada-tab ps-1")}
                        onClick={() => below['sm'](deviceSize) && isOpen && toggleSidebar()}
                        type="link"
                        to={tab.url}
                    />;
                })
            }
        </div>
    </ContentSidebar>;
};
