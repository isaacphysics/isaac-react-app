import React, { useState } from "react";
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
        url: "/set_tests",
        icon: "icon-school",
    },
    markbook: {
        title: "Markbook",
        url: "/my_markbook",
        icon: "icon-done-all",
    },
    assignedToMe: {
        title: "Assigned to me",
        url: "/assignments",
        icon: "icon-person-check",
    },
    account: {
        title: "Account",
        url: "/account",
        icon: "icon-cog",
    }
};

interface AdaSidebarCollapserProps extends React.HTMLAttributes<HTMLButtonElement> {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdaSidebarCollapser = ({collapsed, setCollapsed, ...rest}: AdaSidebarCollapserProps) => {
    return <button
        {...rest}
        type="button"
        className={classNames("bg-transparent w-100 d-flex justify-content-center align-items-center px-3 my-ada-tab", rest.className)}
        onClick={() => setCollapsed(c => !c)}
    >
        <b className="flex-grow-1 text-start">My Ada</b>
        <i className={classNames("icon icon-md icon-md", collapsed ? "icon-chevron-right" : "icon-chevron-left")} aria-hidden="true" />
    </button>;
};


export const MyAdaSidebar = (props: ContentSidebarProps) => {
    const history = useHistory();
    const [collapsed, setCollapsed] = useState(false);

    return <ContentSidebar {...props} className={classNames(props.className, {"collapsed": collapsed})}>

        <AdaSidebarCollapser collapsed={collapsed} setCollapsed={setCollapsed} />

        {Object.entries(MyAdaTabs).map(([key, tab]) => {
            const isActive = history.location.pathname === tab.url;
            return <StyledTabPicker
                key={key}
                id={`tab-${tab.title.replace(" ", "-").toLowerCase()}`}
                checkboxTitle={<div className="d-flex align-items-center gap-2">
                    <i className={classNames("icon icon-md", tab.icon, {"icon-color-black": isActive && collapsed})} aria-hidden="true" />
                    <b>{tab.title}</b>
                </div>}
                checked={isActive}
                className="nav-link my-ada-tab"
                type="link"
                to={tab.url}
            />;
        })}
    </ContentSidebar>;
};
