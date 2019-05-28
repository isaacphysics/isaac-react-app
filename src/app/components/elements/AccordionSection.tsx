import React, {useState} from "react";

interface AccordionsProps {
    title?: string;
    children: {};
}

export const AccordionSection = ({title, children}: AccordionsProps) => {
    return <React.Fragment>
        {title && <h2 className="h-question mb-4">
            <span className="mr-3">
                {title}
            </span>
        </h2>}
        {children}
    </React.Fragment>;
};


/*
import React, {useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";

interface TabsProps {
    className?: string;
    tabTitleClass?: string;
    tabContentClass?: string;
    children: {};
}

export const Tabs = ({className = "", tabTitleClass = "", tabContentClass = "", children}: TabsProps) => {
    const [activeTab, setActiveTab] = useState(1);
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

 */
