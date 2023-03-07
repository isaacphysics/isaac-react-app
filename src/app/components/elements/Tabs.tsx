import React, {ReactNode, useEffect, useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {pauseAllVideos} from "../content/IsaacVideo";
import {isAda, isDefined, siteSpecific} from "../../services";
import classNames from "classnames";
import {useStatefulElementRef} from "./markup/portals/utils";
import {useExpandContent} from "./markup/portals/Tables";
import {ExpandableParentContext} from "../../../IsaacAppTypes";
import {Markup} from "./markup";

type StringOrTabFunction = string | ((tabTitle: string, tabIndex: number) => string);

interface TabsProps {
    className?: string;
    tabTitleClass?: StringOrTabFunction;
    tabContentClass?: string;
    children: {};
    activeTabOverride?: number;
    onActiveTabChange?: (tabIndex: number) => void;
    deselectable?: boolean;
    refreshHash?: string;
    expandable?: boolean;
    singleLine?: boolean;
}

function callOrString(stringOrTabFunction: StringOrTabFunction, tabTitle: string, tabIndex: number) {
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

export const Tabs = (props: TabsProps) => {
    const {className="", tabTitleClass="", tabContentClass="", children, activeTabOverride, onActiveTabChange, deselectable=false, refreshHash, expandable, singleLine=false} = props;
    const [activeTab, setActiveTab] = useState(activeTabOverride || 1);

    useEffect(() => {
        if (isDefined(activeTabOverride)) {
            setActiveTab(activeTabOverride);
        }
    }, [activeTabOverride, refreshHash]);

    function changeTab(tabIndex: number) {
        pauseAllVideos();
        let nextTabIndex = tabIndex;
        if (deselectable && activeTab === tabIndex) {
            nextTabIndex = -1;
        }
        setActiveTab(nextTabIndex);
        if (onActiveTabChange && activeTab !== nextTabIndex) {
            onActiveTabChange(nextTabIndex);
        }
    }

    const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLDivElement>();
    const {expandButton, innerClasses, outerClasses} = useExpandContent(expandable ?? false, expandRef);

    return <div className={classNames({"mt-4": isDefined(expandButton)}, outerClasses)} ref={updateExpandRef}>
        {expandButton}
        <div
            className={classNames(className, innerClasses, "position-relative")}
        >
            <Nav tabs className={classNames("flex-wrap", {"guaranteed-single-line": singleLine})}>
                {Object.keys(children).map((tabTitle, mapIndex) => {
                    const tabIndex = mapIndex + 1;
                    const linkClasses = callOrString(tabTitleClass, tabTitle, tabIndex);
                    return <NavItem key={tabTitle} className={classNames("text-center", {"active": activeTab === tabIndex})}>
                        <NavLink
                            tag="button" type="button" className={linkClasses} name={tabTitle.replace(" ", "_")}
                            tabIndex={0} onClick={() => changeTab(tabIndex)}
                        >
                            <Markup encoding={"latex"} className={siteSpecific("", "px-2")}>
                                {tabTitle}
                            </Markup>
                        </NavLink>
                    </NavItem>;
                })}
            </Nav>

            <ExpandableParentContext.Provider value={true}>
                <TabContent activeTab={activeTab} className={tabContentClass}>
                    {Object.entries(children).map(([tabTitle, tabBody], mapIndex) => {
                        const tabIndex = mapIndex + 1;
                        return <TabPane key={tabTitle} tabId={tabIndex}>
                            {tabBody as ReactNode}
                        </TabPane>;
                    })}
                </TabContent>
            </ExpandableParentContext.Provider>
        </div>
    </div>;
};
