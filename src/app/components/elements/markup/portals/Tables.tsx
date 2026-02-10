import React, {MouseEventHandler, useCallback, useContext, useMemo, useState} from "react";
import classNames from "classnames";
import ReactDOM from "react-dom";
import {above, isAda, isMobile, siteSpecific, useDeviceSize} from "../../../../services";
import {ScrollShadows} from "../../ScrollShadows";
import {ExpandableParentContext} from "../../../../../IsaacAppTypes";
import {PortalInHtmlHook, useStatefulElementRef, useTableCompatiblePortalsInHtml} from "./utils";
import { HorizontalScroller } from "../../inputs/HorizontalScroller";
import isEqual from "lodash/isEqual";

// A portal component to manage table elements from inside the React DOM
const Table = ({id, html, classes, rootElement}: TableData & {rootElement: HTMLElement}) => {
    const parentElement = rootElement.querySelector(`#table-${id}`);

    const tableHtml = `<table class="${classNames(classes, "table table-bordered w-100 bg-white m-0", siteSpecific("text-center", "text-start"))}">${html}</table>`;
    const [modifyHtml, renderPortalElements] = useTableCompatiblePortalsInHtml();
    const modifiedHtml = useMemo(() => modifyHtml(tableHtml, id), [tableHtml, id, modifyHtml]);

    const [scrollRef, updateScrollRef] = useStatefulElementRef<HTMLDivElement>();
    const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLElement>();
    const {expandButton, innerClasses, outerClasses} = useExpandContent(classes.includes("expandable"), expandRef, "mb-4");
    const tableInnerClasses = classNames(innerClasses, {"overflow-auto": !classes.includes("topScrollable")});
    const tableOuterClasses = classNames(outerClasses, "isaac-table");
    
    if (modifiedHtml && parentElement) {
        console.log(`creating a table portal at #table-${id}.`);
        return ReactDOM.createPortal(
            <div className={tableOuterClasses} ref={updateExpandRef}>
                <div className={"position-relative"}>
                    {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
                    {isAda && window.ResizeObserver && <ScrollShadows element={scrollRef} />}
                    {expandButton}
                    <HorizontalScroller enabled={classes.includes("topScrollable")}>
                        <div ref={updateScrollRef} className={tableInnerClasses} dangerouslySetInnerHTML={{__html: modifiedHtml}} />
                    </HorizontalScroller>
                    {renderPortalElements(scrollRef)}
                </div>
            </div>,
            parentElement
        );
    }
    return null;
};

export const useExpandContent = (expandable: boolean, el?: HTMLElement, unexpandedInnerClasses = "") => {
    const [ expanded, setExpanded ] = useState(false);

    const toggleExpanded: MouseEventHandler = (event) => {
        const newExpanded = !expanded;
        if (newExpanded) {
            el?.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
        setExpanded(newExpanded);
    };

    const expandableParent = useContext(ExpandableParentContext);
    const deviceSize = useDeviceSize();

    const show = isAda && expandable && !isMobile() && above["md"](deviceSize) && !expandableParent;

    const expandButton = (show && <div className={"expand-button position-relative"}>
        <button type={"button"} aria-label={"Expand content"} onClick={toggleExpanded}>
            <div><span><img aria-hidden alt="" src={"/assets/common/icons/expand-arrow.svg"}/> {expanded ? "Close" : "Expand"}</span></div>
        </button>
    </div>) || null;

    // If screen size goes below md, then the `isaac-expand-bg` class no longer applies (the screen is too thin)
    const innerClasses = (expanded && show) ? "" : unexpandedInnerClasses;
    const outerClasses = show ? (expanded ? "isaac-expand-bg expand-outer" : "expand-outer") : "";

    return {expandButton, innerClasses, outerClasses};
};

interface TableData {
    id: string;
    html: string;
    classes: string[];
    expandable?: boolean;
}

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useAccessibleTablesInHtml: PortalInHtmlHook = () => {
    const [tableInnerHTMLs, setTableInnerHTMLs] = useState<TableData[]>([]);
    
    const modifyHtml = useCallback((html: string, parentId?: string): string => {
        // This is more robust than writing regex, and is surprisingly very quick!
        const htmlDom = document.createElement("html");
        htmlDom.innerHTML = html;

        const tableElements = [...htmlDom.getElementsByTagName("table")];

        const newInnerTableHtmls: TableData[] = [];

        // Loop through tables in reverse, so that changes to a nested table will happen before the `innerHtml` of its parent
        // table is recorded in `tableInnerHTMLs`
        for (let i = tableElements.length - 1; i >= 0; i--) {
            const table: HTMLTableElement = tableElements[i];

            // If table is marked as ignored, then pass - this means that it is nested inside another table (and this was
            // found in a prior pass)
            if ("ignore" in table.dataset) continue;

            const tableCurrentClasses = (table.getAttribute("class") || "").split(/\s+/);
            const parent = table.parentElement as HTMLElement;
            const div = document.createElement("div");

            // Only manage the `table` in React if it doesn't have another `table` as an ancestor - `table`s will always have at least
            // a `body` element as an ancestor.
            if (table.parentElement?.closest("table") === null) {
                if (newInnerTableHtmls.some(t => t.id === `${parentId}-${i}`)) continue; // safeguard against duplicate table ids (if parent ids are not unique?)
                // This table has no table ancestors, so set it up to manage it within React (so we can add shadows and expand them etc.)
                newInnerTableHtmls.push({id: `${parentId}-${i}`, html: table.innerHTML, classes: tableCurrentClasses});
                div.setAttribute("id", `table-${parentId}-${i}`);
                parent.insertBefore(div, table);
                parent.removeChild(table);
            } else {
                // This `table` is inside another `table`, so don't make it a portal element
                table.setAttribute("class", classNames(tableCurrentClasses, "table table-bordered w-100 text-center bg-white m-0"));
                table.dataset.ignore = "true";
                // Insert parent div to handle table overflow
                div.setAttribute("class", "overflow-auto");
                parent.insertBefore(div, table);
                div.appendChild(parent.removeChild(table));
            }
        }

        setTableInnerHTMLs(t => {
            if (isEqual(t, newInnerTableHtmls)) return t;
            return newInnerTableHtmls;
        });
        return htmlDom.innerHTML;
        
    }, []);

    const portalFunc = useCallback((ref?: HTMLElement): JSX.Element[] => {
        if (ref && tableInnerHTMLs.length > 0) {
            return tableInnerHTMLs.map(({id, html, classes}) => <Table key={id} rootElement={ref} id={id} html={html} classes={classes}/>);
        }
        return [];
    }, [tableInnerHTMLs]);

    return [modifyHtml, portalFunc];
};
