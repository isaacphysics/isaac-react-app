import React, {ReactNode, useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {TrustedMarkdown} from "./TrustedMarkdown";
import {TrustedHtml} from "./TrustedHtml";

type StringOrTabFunction = string | ((tabTitle: string, tabIndex: number) => string);

interface TabsProps {
    className?: string;
    tabTitleClass?: StringOrTabFunction;
    tabContentClass?: string;
    children: {};
    activeTabOverride?: number;
    activeTabChanged?: (tabIndex: number) => void;
    deselectable?: boolean;
}

function callOrString(stringOrTabFunction: StringOrTabFunction, tabTitle: string, tabIndex: number) {
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

export const Tabs = (props: TabsProps) => {
    const {className="", tabTitleClass="", tabContentClass="", children, activeTabOverride, activeTabChanged, deselectable=false} = props;
    const [activeTab, setActiveTab] = useState(activeTabOverride || 1);

    function changeTab(tabIndex: number) {
        let nextTabIndex = tabIndex;
        if (deselectable && activeTab === tabIndex) {
            nextTabIndex = -1;
        }
        setActiveTab(nextTabIndex);
        if (activeTabChanged) {
            activeTabChanged(nextTabIndex);
        }
    }

    return <div
        key={activeTabOverride} // important because we want to reset state if the activeTabOverride prop is changed
        className={className}
    >
        <Nav tabs className="flex-wrap">
            {Object.keys(children).map((tabTitle, mapIndex) => {
                const tabIndex = mapIndex + 1;
                const c = callOrString(tabTitleClass, tabTitle, tabIndex);
                const classes = activeTab === tabIndex ? `${c} active` : c;
                return <NavItem key={tabTitle} className="px-3 text-center">
                    <NavLink
                        tag="button" type="button" name={tabTitle.replace(" ", "_")}
                        tabIndex={0} className={classes} onClick={() => changeTab(tabIndex)}
                    >
                        <TrustedHtml html={tabTitle} />
                    </NavLink>
                </NavItem>;
            })}
        </Nav>

        <TabContent activeTab={activeTab} className={tabContentClass}>
            {Object.entries(children).map(([tabTitle, tabBody], mapIndex) => {
                const tabIndex = mapIndex + 1;
                return <TabPane key={tabTitle} tabId={tabIndex}>
                    {tabBody as ReactNode}
                </TabPane>;
            })}
        </TabContent>
    </div>;
};
