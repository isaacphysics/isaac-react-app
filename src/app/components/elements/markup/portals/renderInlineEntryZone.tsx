import React, { useContext } from "react";
import { PortalInHtmlHook } from "./utils";
import { InlineContext } from "../../../../../IsaacAppTypes";
import InlineEntryZoneBase from "./InlineEntryZone";
import { siteSpecific } from "../../../../services";

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useInlineEntryZoneInHtml: PortalInHtmlHook = (html) => {
    // If not in an inline string entry zone, don't bother trying to find and render inline divs
    const inlineZoneContext = useContext(InlineContext);
    if (!inlineZoneContext) return [html, () => []];

    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;

    // Looks for all span elements with ids starting with "inline-question-".
    const inlineZones = htmlDom.querySelectorAll("span[id^='inline-question-']") as NodeListOf<HTMLElement>;
    if (inlineZones.length === 0) return [html, () => []];

    const inlineZoneConstructors: {id: string, className: string, width: number | undefined, height: number | undefined}[] = [];

    for (let i = 0; i < inlineZones.length; i++) {
        const zone = inlineZones[i];
        let className = "";
        let defaultWidth = true;
        let defaultHeight = true;
        for (const c of zone.classList) {
            if (c.match(/w-\d+/)) {
                className += c + " ";
                defaultWidth = false;
            }
            if (c.match(/h-\d+/)) {
                className += c + " ";
                defaultHeight = false;
            }
        }
        const width = defaultWidth ? 100 : undefined;
        const height = defaultHeight ? 27 : undefined;
        inlineZoneConstructors.push({id: inlineZones[i].id, className, width, height});
    }
    
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? inlineZoneConstructors.map(({id, className, width, height}) =>
            <InlineEntryZoneBase
                key={id}
                className={className}
                inlineSpanId={id}
                width={width}
                height={height}
                root={ref}
            />
        ) : []
    ];
};