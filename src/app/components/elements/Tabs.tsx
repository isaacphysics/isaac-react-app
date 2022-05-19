import React, {ReactNode, useEffect, useState} from "react";
import {Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {pauseAllVideos} from "../content/IsaacVideo";
import {isDefined} from "../../services/miscUtils";
import classNames from "classnames";
import {useStatefulElementRef} from "./html-rendering/portals/utils";
import {useExpandContent} from "./html-rendering/portals/Tables";
import {ExpandableParentContext} from "../../../IsaacAppTypes";
import {TrustedMarkup} from "./html-rendering/TrustedMarkup";

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
}

function callOrString(stringOrTabFunction: StringOrTabFunction, tabTitle: string, tabIndex: number) {
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

export const Tabs = (props: TabsProps) => {
    const {className="", tabTitleClass="", tabContentClass="", children, activeTabOverride, onActiveTabChange, deselectable=false, refreshHash, expandable} = props;
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
                            <TrustedMarkup markup={tabTitle} encoding={"latex"} />
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
