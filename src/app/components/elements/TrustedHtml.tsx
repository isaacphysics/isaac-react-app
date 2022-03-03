import React, {RefObject, useContext, useRef, useState} from "react";
import 'katex/dist/contrib/mhchem.js';
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {katexify} from "./LaTeX";
import {useClozeDropRegionsInHtml} from "../content/IsaacClozeQuestion";
import ReactDOM from "react-dom";
import classNames from "classnames";
import {ScrollPrompt} from "./ScrollPrompt";
import {above, isMobile, useDeviceSize} from "../../services/device";

interface TableData {
    id: number;
    html: string;
    classes: string[];
}

const htmlDom = document.createElement("html");
function manipulateHtml(html: string): {manipulatedHtml: string, tableData: TableData[]} {
    // This can't be quick but it is more robust than writing regular expressions...
    htmlDom.innerHTML = html;

    // Table manipulation
    const tableElements = htmlDom.getElementsByTagName("table");
    const tableInnerHTMLs: TableData[] = [];
    for (let i = 0; i < tableElements.length; i++) {
        const table = tableElements[i];
        // Insert parent div to handle table overflow
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");
        div.setAttribute("id", `table-${i}`);
        parent.insertBefore(div, table);
        tableInnerHTMLs.push({id: i, html: table.innerHTML, classes: (table.getAttribute("class") || "").split(" ")});
        parent.removeChild(table);
    }
    return {manipulatedHtml: htmlDom.innerHTML, tableData: tableInnerHTMLs};
}

export const useExpandContent = (unexpandedInnerClasses?: string) => {
    const [ expanded, setExpanded ] = useState(false);
    const toggleExpanded = () => setExpanded(b => !b);

    const deviceSize = useDeviceSize();

    const expandButton = (!isMobile() && <button className={"expand-arrow"} style={{top: 9, right: 6, zIndex: 2}} onClick={toggleExpanded}>
        <img src={"/assets/expand-arrow.svg"}/>
    </button>) || null;

    // If screen size goes below md, then the `parsons-layout` class no longer applies - this means we shouldn't apply
    // the classes `parsons-layout` and `isaac-expand-bg`.
    const shouldExpand = expanded && above["md"](deviceSize);

    const innerClasses = shouldExpand ? "" : unexpandedInnerClasses;
    const outerClasses = shouldExpand ? "isaac-expand-bg expand-outer" : "expand-outer";

    return {expandButton, innerClasses, outerClasses};
}

// A portal component to manage table elements from inside the React DOM
const Table = ({id, html, classes, rootElement}: TableData & {rootElement: RefObject<HTMLElement>}) => {
    const parentElement = rootElement.current?.querySelector(`#table-${id}`);

    const divRef = useRef<HTMLDivElement>(null);
    const {expandButton, innerClasses, outerClasses} = useExpandContent("overflow-auto mb-4");

    if (html && parentElement) {
        return ReactDOM.createPortal(
            <div className={outerClasses}>
                <ScrollPrompt scrollRef={divRef} />
                <div ref={divRef} className={innerClasses}>
                    {expandButton}
                    <table className={classNames(classes, "table table-bordered w-100 text-center bg-white m-0")} dangerouslySetInnerHTML={{__html: html}}/>
                </div>
            </div>,
            parentElement
        );
    }
    return null;
}

export const TrustedHtml = ({html, span, className}: {html: string; span?: boolean; className?: string}) => {
    const user = useSelector(selectors.user.orNull);
    const booleanNotation = useSelector((state: AppState) => state?.userPreferences?.BOOLEAN_NOTATION || null);
    const screenReaderHoverText = useSelector((state: AppState) => state && state.userPreferences &&
        state.userPreferences.BETA_FEATURE && state.userPreferences.BETA_FEATURE.SCREENREADER_HOVERTEXT || false);

    const figureNumbers = useContext(FigureNumberingContext);

    const htmlRef = useRef<HTMLDivElement>(null);

    const {manipulatedHtml, tableData} = manipulateHtml(katexify(html, user, booleanNotation, screenReaderHoverText, figureNumbers));
    html = useClozeDropRegionsInHtml(manipulatedHtml);

    const ElementType = span ? "span" : "div";
    return <>
        <ElementType ref={htmlRef} className={className} dangerouslySetInnerHTML={{__html: html}} />
        {tableData.map(({id, html, classes}) => <Table key={id} rootElement={htmlRef} id={id} html={html} classes={classes} />)}
    </>;
};
