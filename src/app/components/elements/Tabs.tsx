import React, {ReactNode, useEffect, useRef, useState} from "react";
import {Button, ButtonGroup, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import {pauseAllVideos} from "../content/IsaacVideo";
import {isAda, isDefined, isPhy, siteSpecific} from "../../services";
import classNames from "classnames";
import {useStatefulElementRef} from "./markup/portals/utils";
import {useExpandContent} from "./markup/portals/Tables";
import {ExpandableParentContext} from "../../../IsaacAppTypes";
import {Markup} from "./markup";
import { AffixButton } from "./AffixButton";

type StringOrTabFunction = string | ((tabTitle: string, tabIndex: number) => string);
export type TabStyle = "tabs" | "buttons" | "dropdowns" | "cards";
interface TabsProps {
    className?: string;
    tabTitleClass?: StringOrTabFunction;
    tabNavbarClass?: string;
    tabContentClass?: string;
    children: {[tabTitle: string]: React.ReactNode};
    activeTabOverride?: number;
    onActiveTabChange?: (tabIndex: number) => void;
    deselectable?: boolean;
    refreshHash?: string;
    expandable?: boolean;
    singleLine?: boolean;
    style?: TabStyle;
    dataTestId?: string;
}

function callOrString(stringOrTabFunction: StringOrTabFunction | undefined, tabTitle: string, tabIndex: number) {
    if (!stringOrTabFunction) return "";
    if (typeof stringOrTabFunction == 'string') return stringOrTabFunction;
    return stringOrTabFunction(tabTitle, tabIndex);
}

// e.g.:   Tab 1 | Tab 2 | Tab 3
const TabNavbar = ({singleLine, children, tabTitleClass, activeTab, changeTab, className, dataTestId}: TabsProps & {activeTab: number; changeTab: (i: number) => void;}) => {
    return <Nav tabs className={classNames(className, "flex-wrap", {"guaranteed-single-line": singleLine})} data-testid={dataTestId}>
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

// e.g.:   (Tab 1|Tab 2|Tab 3), i.e. as joined buttons
const ButtonNavbar = ({children, activeTab, changeTab, tabTitleClass="", className, dataTestId}: TabsProps & {activeTab: number; changeTab: (i: number) => void}) => {
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

    return <div className={"w-100 text-center"} data-testid={dataTestId}>
        <ButtonGroup className={classNames(className, "selector-tabs")}>
            {Object.keys(children).map((tabTitle, i) =>
                <Button key={i} innerRef={el => buttonRefs.current[i] = el}
                    color={"secondary"} outline={activeTab !== i + 1}
                    tabIndex={0} onClick={() => changeTab(i + 1)}
                    className={callOrString(tabTitleClass, tabTitle, i + 1)}
                >
                    <Markup encoding={"latex"}>{tabTitle}</Markup>
                </Button>
            )}
            <span ref={gliderRef} className={"glider"}/>
        </ButtonGroup>
    </div>;
};

const DropdownNavbar = ({children, activeTab, changeTab, tabTitleClass, className, dataTestId}: TabsProps & {activeTab: number; changeTab: (i: number) => void}) => {
    return <div className={classNames(className, "mt-3 mb-1")} data-testid={dataTestId}>
        {Object.keys(children).map((tabTitle, i) =>
            <AffixButton key={tabTitle} color="tint" className={classNames("btn-dropdown me-2 mb-2", tabTitleClass, {"active": activeTab === i + 1})} onClick={() => changeTab(i + 1)} affix={{
                affix: "icon-chevron-right",
                position: "suffix",
                type: "icon",
                affixClassName: classNames("ms-2 icon-dropdown-90", {"active icon-color-white": activeTab === i + 1}),
            }}>
                <Markup encoding={"latex"}>{tabTitle}</Markup>
            </AffixButton>
        )}
    </div>;
};

const CardsNavbar = ({children, activeTab, changeTab, tabTitleClass="", dataTestId}: TabsProps & {activeTab: number; changeTab: (i: number) => void}) => {
    return <div className="d-flex card-tabs" data-testid={dataTestId}>
        {Object.keys(children).map((tabTitle, i) =>
            <button key={i} className={classNames(tabTitleClass, "flex-grow-1 py-3 card-tab", {"active": activeTab === i + 1})} onClick={() => changeTab(i + 1)} type="button">
                <Markup encoding={"latex"}>{tabTitle}</Markup>
            </button>
        )}
    </div>;
};

export const Tabs = (props: TabsProps) => {
    const {
        className, tabContentClass, tabNavbarClass, children, activeTabOverride, onActiveTabChange,
        deselectable=undefined, refreshHash, expandable, style=(siteSpecific("dropdowns", "tabs")),
    } = props;
    const [activeTab, setActiveTab] = useState(activeTabOverride || 1);

    const isDeselectable = deselectable ?? (style === "dropdowns" ? true : deselectable);

    useEffect(() => {
        if (isDefined(activeTabOverride)) {
            setActiveTab(activeTabOverride);
        }
    }, [activeTabOverride, refreshHash]);

    function changeTab(tabIndex: number) {
        pauseAllVideos();
        let nextTabIndex = tabIndex;
        if (isDeselectable && activeTab === tabIndex) {
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
        <div className={classNames(className, innerClasses, `tab-style-${style}`, "position-relative")}>
            {style === "tabs"
                ? <TabNavbar {...props} className="no-print" activeTab={activeTab} changeTab={changeTab} dataTestId="tab-navbar">{children}</TabNavbar>
                : style === "buttons"
                    ? <ButtonNavbar {...props} activeTab={activeTab} changeTab={changeTab} dataTestId="tab-navbar">{children}</ButtonNavbar>
                    : style === "dropdowns" 
                        ? <DropdownNavbar {...props} className={classNames({"no-print": isPhy}, tabNavbarClass)} activeTab={activeTab} changeTab={changeTab} dataTestId="tab-navbar">{children}</DropdownNavbar>
                        : <CardsNavbar  {...props} activeTab={activeTab} changeTab={changeTab} dataTestId="tab-navbar">{children}</CardsNavbar>
            }
            <ExpandableParentContext.Provider value={true}>
                <TabContent activeTab={activeTab} className={tabContentClass}>
                    {Object.entries(children).map(([tabTitle, tabBody], mapIndex) => {
                        const tabIndex = mapIndex + 1;
                        return <React.Fragment key={tabTitle}>
                            {/* This navbar exists only when printing so each tab has its own heading */}
                            {style === "tabs" ?
                                <TabNavbar {...props} className={classNames("d-none d-print-flex mb-3 mt-2", {"mt-n4": mapIndex === 0 && tabContentClass?.includes("pt-4")})} activeTab={tabIndex} changeTab={changeTab}>
                                    {children}
                                </TabNavbar> :
                                style === "dropdowns" && isPhy && 
                                <DropdownNavbar {...props} className={classNames("d-none d-print-flex mb-3 mt-2", {"mt-n4": mapIndex === 0 && tabContentClass?.includes("pt-4")})} activeTab={tabIndex} changeTab={changeTab}>
                                    {children}
                                </DropdownNavbar>
                            }
                            <TabPane key={tabTitle} tabId={tabIndex} data-testid={tabIndex === activeTab ? "active-tab-pane" : undefined}>
                                {tabBody as ReactNode}
                            </TabPane>
                        </React.Fragment>;
                    })}
                </TabContent>
            </ExpandableParentContext.Provider>
        </div>
    </div>;
};
