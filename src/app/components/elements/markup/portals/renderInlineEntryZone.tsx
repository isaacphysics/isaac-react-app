import React, { useContext } from "react";
import { PortalInHtmlHook } from "./utils";
import { InlineContext } from "../../../../../IsaacAppTypes";
import InlineEntryZoneBase from "./InlineEntryZone";
import classNames from "classnames";

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

    const inlineZoneConstructors: {id: string, className: string, widthPx?: number, heightPx?: number}[] = [];

    for (let i = 0; i < inlineZones.length; i++) {
        inlineZoneConstructors.push({
            id: inlineZones[i].id, 
            className: classNames("inline-data-target", (inlineZones[i].dataset.classes ?? "")), 
            widthPx: inlineZones[i].dataset.width ? parseInt(inlineZones[i].dataset.width as string) : undefined,
            heightPx: inlineZones[i].dataset.height ? parseInt(inlineZones[i].dataset.height as string) : undefined,
        });
    }
    
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? inlineZoneConstructors.map(({id, className, widthPx, heightPx}) =>
            <InlineEntryZoneBase
                key={id}
                className={className}
                inlineSpanId={id}
                widthPx={widthPx}
                heightPx={heightPx}
                root={ref}
            />
        ) : []
    ];
};
