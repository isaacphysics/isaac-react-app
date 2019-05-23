import React, {useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";

interface IsaacTabsProps {
    tabNavLinkClass?: string;
    children: {};
}

export const IsaacTabs = ({tabNavLinkClass = "", children}: IsaacTabsProps) => {
    const [activeTab, setActiveTab] = useState(1);
    const tabs = children;

    return <React.Fragment>
        <Nav tabs>
            {Object.keys(tabs).map((tabTitle, mapIndex) => {
                const tabIndex = mapIndex + 1;
                const classes = activeTab === tabIndex ? `${tabNavLinkClass} active` : tabNavLinkClass;
                return <NavItem key={tabTitle} className="px-3">
                    <NavLink className={classes} onClick={() => setActiveTab(tabIndex)}>
                        {tabTitle}
                    </NavLink>
                </NavItem>;
            })}
        </Nav>

        <TabContent activeTab={activeTab} className="pt-5">
            {Object.entries(tabs).map(([tabTitle, tabBody], mapIndex) => {
                const tabIndex = mapIndex + 1;
                return <TabPane key={tabTitle} tabId={tabIndex}>
                    {tabBody}
                </TabPane>;
            })}
        </TabContent>
    </React.Fragment>;
};
