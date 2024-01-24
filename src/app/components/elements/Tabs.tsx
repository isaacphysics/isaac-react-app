import React, {ReactNode, useEffect, useRef, useState} from "react";
import {Button, ButtonGroup, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
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
    children: {[tabTitle: string]: React.ReactNode};
    activeTabOverride?: number;
    onActiveTabChange?: (tabIndex: number) => void;
    deselectable?: boolean;
    refreshHash?: string;
    expandable?: boolean;
    singleLine?: boolean;
    style?: "tabs" | "buttons";
}

function callOrString(stringOrTabFunction: StringOrTabFunction | undefined, tabTitle: string, tabIndex: number) {
    if (!stringOrTabFunction) return "";
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

const TabNavbar = ({singleLine, children, tabTitleClass, activeTab, changeTab}: TabsProps & {activeTab: number; changeTab: (i: number) => void}) => {
    return <Nav tabs className={classNames("flex-wrap", {"guaranteed-single-line": singleLine})}>
        {Object.keys(children).map((tabTitle, mapIndex) => {
            const tabIndex = mapIndex + 1;
            const linkClasses = callOrString(tabTitleClass, tabTitle, tabIndex);
            return <NavItem key={tabTitle} className={classNames({"active": activeTab === tabIndex, "text-center": isAda})}>
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
    </Nav>;
};

const ButtonNavbar = ({children, activeTab, changeTab, tabTitleClass=""}: TabsProps & {activeTab: number; changeTab: (i: number) => void}) => {
    const gliderRef = useRef<HTMLSpanElement>(null);
    const numberOfTabs = Object.keys(children).length;
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>(Array(numberOfTabs).fill(null));

    // Position glider correctly every render, because changing screen size
    // might mess up its position.
    if (gliderRef.current && buttonRefs.current?.[activeTab - 1]) {
        const xOffset = buttonRefs.current[activeTab - 1]?.offsetLeft ?? 0;
        const yOffset = buttonRefs.current[activeTab - 1]?.offsetTop ?? 0;
        const width = buttonRefs.current[activeTab - 1]?.clientWidth ?? 0;
        gliderRef.current.style.width = `${width + 3}px`;
        gliderRef.current.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }

    return <div className={"w-100 text-center"}>
        <ButtonGroup className={"selector-tabs"}>
            {Object.keys(children).map((tabTitle, i) =>
                <Button key={i} innerRef={el => buttonRefs.current[i] = el}
                        color={"secondary"} outline={activeTab !== i + 1}
                        tabIndex={0} onClick={() => changeTab(i + 1)}
                        className={callOrString(tabTitleClass, tabTitle, i + 1)}
                >
                    {tabTitle}
                </Button>
            )}
            <span ref={gliderRef} className={"glider"}/>
        </ButtonGroup>
    </div>;
};

export const Tabs = (props: TabsProps) => {
    const {
        className="", tabContentClass="", children, activeTabOverride, onActiveTabChange,
        deselectable=false, refreshHash, expandable, style="tabs"
    } = props;
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
        <div className={classNames(className, innerClasses, "position-relative")}>
            {style === "tabs"
                ? <TabNavbar activeTab={activeTab} changeTab={changeTab} {...props}>{children}</TabNavbar>
                : <ButtonNavbar activeTab={activeTab} changeTab={changeTab} {...props}>{children}</ButtonNavbar>
            }
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
