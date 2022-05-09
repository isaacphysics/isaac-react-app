import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import {ClozeDropRegionContext} from "../../../IsaacAppTypes";
import {useKatex} from "./LaTeX";
import {useClozeDropRegionsInHtml} from "../content/IsaacClozeQuestion";
import ReactDOM from "react-dom";
import classNames from "classnames";
import {ScrollShadows} from "./ScrollShadows";
import {above, isMobile, useDeviceSize} from "../../services/device";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {isDefined} from "../../services/miscUtils";

interface TableData {
    id: number;
    html: string;
    classes: string[];
    expandable?: boolean;
}

const htmlDom = document.createElement("html");
function useAccessibleTables(html: string): {htmlWithModifiedTables: string, tableData: TableData[]} {
    // Skip turning the table into a portal component if we are in a cloze question exposition. This is because if
    // the HTML that provides the root element for a drop-zone is put inside a Table component, then the Table might
    // re-render and not cause the InlineDropZone related to that root element to rerender, since the InlineDropZone
    // is a child component of IsaacClozeQuestion, and not Table.
    const dropRegionContext = useContext(ClozeDropRegionContext);
    const renderTablesInPortals = !(dropRegionContext && dropRegionContext.questionPartId);

    // This can't be quick but it is more robust than writing regular expressions...
    htmlDom.innerHTML = html;

    // Table manipulation
    const tableElements = [...htmlDom.getElementsByTagName("table")];
    const tableInnerHTMLs: TableData[] = [];
    for (let i = 0; i < tableElements.length; i++) {
        const table = tableElements[i];
        // Insert parent div to handle table overflow
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");
        if (!renderTablesInPortals) {
            table.setAttribute("class", classNames("table table-bordered w-100 text-center bg-white m-0", table.className));
            div.setAttribute("class", "overflow-auto mb-4");
            parent.insertBefore(div, table);
            div.appendChild(parent.removeChild(table));
        } else {
            div.setAttribute("id", `table-${i}`);
            parent.insertBefore(div, table);
            tableInnerHTMLs.push({id: i, html: table.innerHTML, classes: (table.getAttribute("class") || "").split(/\s+/)});
            parent.removeChild(table);
        }
    }
    return {htmlWithModifiedTables: htmlDom.innerHTML, tableData: tableInnerHTMLs};
}

export const ExpandableParentContext = React.createContext<boolean>(false);

export const useExpandContent = (expandable: boolean, ref: React.RefObject<HTMLElement>, unexpandedInnerClasses = "") => {
    const [ expanded, setExpanded ] = useState(false);

    const toggleExpanded = () => {
        const newExpanded = !expanded;
        if (newExpanded) {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
        setExpanded(newExpanded);
    }

    const expandableParent = useContext(ExpandableParentContext);
    const deviceSize = useDeviceSize();

    const show = SITE_SUBJECT === SITE.CS && expandable && !isMobile() && above["md"](deviceSize) && !expandableParent;

    const expandButton = (show && <div className={"expand-button position-relative"}>
        <button onClick={toggleExpanded}>
            <div><span><img aria-hidden alt={"Button to expand content"} src={"/assets/expand-arrow.svg"}/> {expanded ? "Close" : "Expand"}</span></div>
        </button>
    </div>) || null;

    // If screen size goes below md, then the `isaac-expand-bg` class no longer applies (the screen is too thin)
    const innerClasses = (expanded && show) ? "" : unexpandedInnerClasses;
    const outerClasses = show ? (expanded ? "isaac-expand-bg expand-outer" : "expand-outer") : "";

    return {expandButton, innerClasses, outerClasses};
}

// A portal component to manage table elements from inside the React DOM
const Table = ({id, html, classes, rootElement}: TableData & {rootElement: HTMLElement}) => {
    const [ parentElement, setParentElement ] = useState<Element | null>(null);

    useEffect(() => {
        if (isDefined(rootElement)) {
            setParentElement(rootElement.querySelector(`#table-${id}`));
        }
    }, [rootElement]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const expandRef = useRef<HTMLDivElement>(null);
    const {expandButton, innerClasses, outerClasses} = useExpandContent(classes.includes("expandable"), expandRef, "overflow-auto mb-4");

    if (html && parentElement) {
        return ReactDOM.createPortal(
            <div className={classNames(outerClasses, "position-relative isaac-table")} ref={expandRef}>
                {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
                {SITE_SUBJECT === SITE.CS && window.ResizeObserver && <ScrollShadows scrollRef={scrollRef} />}
                {expandButton}
                <div ref={scrollRef} className={innerClasses}>
                    <table className={classNames(classes, "table table-bordered w-100 text-center bg-white m-0")} dangerouslySetInnerHTML={{__html: html}}/>
                </div>
            </div>,
            parentElement
        );
    }
    return null;
}

export const TrustedHtml = ({html, span, className}: {html: string; span?: boolean; className?: string;}) => {
    const [ htmlRef, setHtmlRef ] = useState<HTMLDivElement>();
    const updateHtmlRef = useCallback(ref => {
        if (ref !== null) {
            setHtmlRef(ref);
        }
    }, []);

    const htmlWithClozeDropZones = useClozeDropRegionsInHtml(html);
    const katexHtml = useKatex(htmlWithClozeDropZones);
    const {htmlWithModifiedTables, tableData} = useAccessibleTables(katexHtml);

    const ElementType = span ? "span" : "div";
    return <>
        <ElementType ref={updateHtmlRef} className={className} dangerouslySetInnerHTML={{__html: htmlWithModifiedTables}} />
        {htmlRef && tableData.map(({id, html, classes}) => <Table key={id} rootElement={htmlRef} id={id} html={html} classes={classes}/>)}
    </>;
};
