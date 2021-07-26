import React, {useContext} from "react";
import 'katex/dist/contrib/mhchem.js';
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {useUserContext} from "../../services/userContext";
import {selectors} from "../../state/selectors";
import {katexify} from "./LaTeX";

const htmlDom = document.createElement("html");
function manipulateHtml(html: string) {
    // This can't be quick but it is more robust than writing regular expressions...
    htmlDom.innerHTML = html;

    // Table manipulation
    const tableElements = htmlDom.getElementsByTagName("table");
    for (let i = 0; i < tableElements.length; i++) {
        const table = tableElements[i];

        // Add bootstrap classes
        const currentTableClasses = (table.getAttribute("class") || "").split(" ");
        const bootstrapTableClasses = ["table", "table-bordered", "w-100", "text-center", "bg-white", "m-0"];
        const uniqueTableClasses = Array.from(new Set([...currentTableClasses, ...bootstrapTableClasses]));
        table.setAttribute("class", uniqueTableClasses.join(" "));

        // Insert parent div to handle table overflow
        const parent = table.parentElement as HTMLElement;
        const div = document.createElement("div");
        div.setAttribute("class", "overflow-auto mb-4");
        parent.insertBefore(div, table);
        div.appendChild(parent.removeChild(table));
    }

    return htmlDom.innerHTML;
}

export const TrustedHtml = ({html, span}: {html: string; span?: boolean}) => {
    const user = useSelector(selectors.user.orNull);
    const screenReaderHoverText = useSelector((state: AppState) => state && state.userPreferences &&
        state.userPreferences.BETA_FEATURE && state.userPreferences.BETA_FEATURE.SCREENREADER_HOVERTEXT || false);
    const {examBoard} = useUserContext();

    const figureNumbers = useContext(FigureNumberingContext);

    html = manipulateHtml(katexify(html, user, examBoard, screenReaderHoverText, figureNumbers));

    const ElementType = span ? "span" : "div";
    return <ElementType dangerouslySetInnerHTML={{__html: html}} />;
};
