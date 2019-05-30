import React, {useState, useEffect} from "react";

interface AccordionsProps {
    id?: string;
    title?: string;
    children: {};
}

export const AccordionSection = ({id, title, children}: AccordionsProps) => {
    let idParts: Array<string> = [];
    if (id) {
        idParts = id.split('|');
    }
    const anchorId = idParts.length > 1 ? idParts[1] : null;

    useEffect(() => {
        const fragment = window.location.hash.slice(1);
        if (fragment === anchorId) {
            const element = document.getElementById(fragment);
            if (element) {
                element.scrollIntoView(true);
            }
        }
    });

    return <React.Fragment>
        {title && <h2 className="h-question mb-4" id={anchorId || ""}>
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
