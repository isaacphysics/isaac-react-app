import React from "react";
import { ContentSidebar, ContentSidebarProps } from "../layout/SidebarLayout";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import classNames from "classnames";
import { selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../../../state";
import { above, below, isStudent, isTeacherOrAbove, useDeviceSize } from "../../../services";
import { Spacer } from "../Spacer";
import { useLocation } from "react-router";

interface MyAdaTab {
    title: string;
    url: string;
    icon: string;
    user: "STUDENT" | "TEACHER" | "ALL"; // Which user roles can see this tab – n.b. teacher means teacherOrAbove
}

const MyAdaTabs: Record<string, MyAdaTab> = {
    overview: {
        title: "Overview",
        url: "/dashboard",
        icon: "icon-home",
        user: "TEACHER"
    },
    groups: {
        title: "Groups",
        url: "/groups",
        icon: "icon-group",
        user: "TEACHER"
    },
    setQuizzes: {
        title: "Quizzes",
        url: "/quizzes/set",
        icon: "icon-file",
        user: "TEACHER"
    },
    setTests: {
        title: "Tests",
        url: "/set_tests",
        icon: "icon-school",
        user: "TEACHER"
    },
    markbook: {
        title: "Markbook",
        url: "/my_markbook",
        icon: "icon-done-all",
        user: "TEACHER"
    },

    assignedToMe: {
        title: "Assigned to me",
        url: "/assignments",
        icon: "icon-person-check",
        user: "ALL"
    },

    myTests: {
        title: "Tests",
        url: "/tests",
        icon: "icon-school",
        user: "STUDENT"
    },
    progress: {
        title: "My Progress",
        url: "/progress",
        icon: "icon-done-all",
        user: "STUDENT"
    },

    account: {
        title: "Account",
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
    return <button
        {...rest}
        type="button"
        className={classNames("bg-transparent d-flex justify-content-between align-items-center w-100 px-3 my-ada-tab", rest.className)}
        onClick={toggleSidebar}
    >
        <b>My Ada</b>
        <Spacer />
        <i className={classNames("icon icon-md", collapsed ? "icon-chevron-right" : "icon-chevron-left")} aria-hidden="true" />
    </button>;
};


export const MyAdaSidebar = (props: ContentSidebarProps) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const deviceSize = useDeviceSize();

    const isOpen = useAppSelector(selectors.sidebar.open);
    const toggleSidebar = () => dispatch(sidebarSlice.actions.toggle());

    return <ContentSidebar {...props} className={classNames(props.className, {"collapsed": !isOpen})} buttonTitle="My Ada">
        <div className="sticky-top overflow-x-hidden">
            {above['md'](deviceSize) && <AdaSidebarCollapser collapsed={!isOpen} toggleSidebar={toggleSidebar} />}

            {Object.entries(MyAdaTabs)
                .filter(([_, tab]) => {
                    if (tab.user === "TEACHER") return isTeacherOrAbove(user);
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
                            <b>{tab.title}</b>
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
