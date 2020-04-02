import React, {useEffect, useState, ReactNode} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";

type StringOrTabFunction = string | ((tabTitle: string, tabIndex: number) => string);

interface TabsProps {
    className?: string;
    tabTitleClass?: StringOrTabFunction;
    tabContentClass?: string;
    children: {};
    activeTabOverride?: number;
    activeTabChanged?: (tabIndex: number) => void;
}

function callOrString(stringOrTabFunction: StringOrTabFunction, tabTitle: string, tabIndex: number) {
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

export const Tabs = (props: TabsProps) => {
    const {className = "", tabTitleClass = "", tabContentClass = "", children, activeTabOverride, activeTabChanged} = props;

    const [activeTab, setActiveTab] = useState(1);
    useEffect(() => {
        if (activeTabOverride) {
            setActiveTab(activeTabOverride);
        }
    }, [activeTabOverride]);

    const tabs = children;

    function changeTab(tabIndex: number) {
        setActiveTab(tabIndex);
        if (activeTabChanged) {
            activeTabChanged(tabIndex);
        }
    }

    const tabTitles = children && Object.keys(children);
    const specialCaseExamBoardTab = tabTitles.includes("AQA") && tabTitles.includes("OCR") && tabTitles.length === 2;

    return <div className={className}>
        {!specialCaseExamBoardTab && <Nav tabs>
            {Object.keys(tabs).map((tabTitle, mapIndex) => {
                const tabIndex = mapIndex + 1;
                const c = callOrString(tabTitleClass, tabTitle, tabIndex);
                const classes = activeTab === tabIndex ? `${c} active` : c;
                return <NavItem key={tabTitle} className="px-3 text-center">
                    <NavLink tag="button" tabIndex={0} className={classes} onClick={() => changeTab(tabIndex)}>
                        {tabTitle}
                    </NavLink>
                </NavItem>;
            })}
        </Nav>}

        <TabContent activeTab={activeTab} className={!specialCaseExamBoardTab ? tabContentClass : ""}>
            {Object.entries(tabs).map(([tabTitle, tabBody], mapIndex) => {
                const tabIndex = mapIndex + 1;
                return <TabPane key={tabTitle} tabId={tabIndex} className={specialCaseExamBoardTab && !(activeTab == tabIndex) ? "no-print" : ""}>
                    {tabBody as ReactNode}
                </TabPane>;
            })}
        </TabContent>
    </div>;
};
