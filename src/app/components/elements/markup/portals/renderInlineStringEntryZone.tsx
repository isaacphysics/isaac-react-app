import React, { useContext } from "react";
import { PortalInHtmlHook } from "./utils";
import { InlineStringEntryZoneContext } from "../../../../../IsaacAppTypes";
import InlineStringEntryZone from "./InlineStringEntryZone";

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useInlineStringEntryZoneInHtml: PortalInHtmlHook = (html) => {
    // If not in an inline string entry zone, don't bother trying to find and render inline divs
    const inlineZoneContext = useContext(InlineStringEntryZoneContext);
    if (!inlineZoneContext) return [html, () => []];

    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;

    // Looks for all span elements with ids starting with "inline-question-".
    const inlineZones = htmlDom.querySelectorAll("span[id^='inline-question-']") as NodeListOf<HTMLElement>;
    if (inlineZones.length === 0) return [html, () => []];

    const inlineZoneConstructors: {id: string, width: number, height: number}[] = [];

    for (let i = 0; i < inlineZones.length; i++) {
        const width = parseInt(inlineZones[i].dataset.width ?? "100");
        const height = parseInt(inlineZones[i].dataset.height ?? "27");
        inlineZoneConstructors.push({id: inlineZones[i].id, width, height});
    }
    
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? inlineZoneConstructors.map(({id, width, height}) =>
            <InlineStringEntryZone
                key={id}
                inlineSpanId={id}
                width={width}
                height={height}
                root={ref}
            />
        ) : []
    ];
};