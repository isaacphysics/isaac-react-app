import React from "react";
import { ContentSidebar, ContentSidebarProps } from "../layout/SidebarLayout";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import classNames from "classnames";
import { useHistory } from "react-router";

interface MyAdaTab {
    title: string;
    url: string;
    icon: string;
}

const MyAdaTabs: Record<string, MyAdaTab> = {
    overview: {
        title: "Overview",
        url: "/dashboard",
        icon: "icon-home",
    },
    groups: {
        title: "Groups",
        url: "/groups",
        icon: "icon-group",
    },
    quizzes: {
        title: "Quizzes",
        url: "/quizzes/set",
        icon: "icon-file",
    },
    tests: {
        title: "Tests",
        url: "/set_tests/",
        icon: "icon-school",
    },
    markbook: {
        title: "Markbook",
        url: "/my_markbook",
        icon: "icon-done-all",
    },
    assignedToMe: {
        title: "Assigned to me",
        url: "/todo",
        icon: "icon-person-check",
    },
    account: {
        title: "Account",
        url: "/account",
        icon: "icon-cog",
    }
};

export const MyAdaSidebar = (props: ContentSidebarProps) => {
    const history = useHistory();
    return <ContentSidebar {...props}>
        {Object.entries(MyAdaTabs).map(([key, tab]) => (
            <StyledTabPicker
                key={key}
                id={tab.title.replace(" ", "-").toLowerCase()}
                checkboxTitle={<div className="d-flex align-items-center gap-2">
                    <i className={classNames("icon icon-md", tab.icon)} aria-hidden="true" />
                    <strong>{tab.title}</strong>
                </div>}
                checked={history.location.pathname === tab.url}
                onClick={() => history.push(tab.url)}
            />
        ))}
    </ContentSidebar>;
};
