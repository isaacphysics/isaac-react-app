import React, {useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";

interface TabsProps {
    className?: string;
    tabTitleClass?: string;
    tabContentClass?: string;
    children: {};
    defaultActiveTab?: number;
}

export const Tabs = ({className = "", tabTitleClass = "", tabContentClass = "", children, defaultActiveTab}: TabsProps) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || 1);
    const tabs = children;

    return <div className={className}>
        <Nav tabs>
            {Object.keys(tabs).map((tabTitle, mapIndex) => {
                const tabIndex = mapIndex + 1;
                const classes = activeTab === tabIndex ? `${tabTitleClass} active` : tabTitleClass;
                return <NavItem key={tabTitle} className="px-3">
                    <NavLink className={classes} onClick={() => setActiveTab(tabIndex)}>
                        {tabTitle}
                    </NavLink>
                </NavItem>;
            })}
        </Nav>

        <TabContent activeTab={activeTab} className={tabContentClass}>
            {Object.entries(tabs).map(([tabTitle, tabBody], mapIndex) => {
                const tabIndex = mapIndex + 1;
                return <TabPane key={tabTitle} tabId={tabIndex}>
                    {tabBody}
                </TabPane>;
            })}
        </TabContent>
    </div>;
};
