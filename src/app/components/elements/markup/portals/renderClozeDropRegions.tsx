import {PortalInHtmlHook} from "./utils";
import React, {lazy, useContext} from "react";
import {DragAndDropRegionContext} from "../../../../../IsaacAppTypes";

// This needs to be in a separate file and lazily imported, so that @hello-pangea/dnd can be split off from the main bundle.
const InlineDropRegion = lazy(() => import("./InlineDropZones"));

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useClozeDropRegionsInHtml: PortalInHtmlHook = (html) => {
    // If not in a cloze question, don't bother trying to find and render drop-zone divs
    const dropRegionContext = useContext(DragAndDropRegionContext);
    if (!dropRegionContext) return [html, () => []];

    const dropIds: { divId: string; zoneId: string; width: string; height: string; }[] = [];
    const safeQuestionId = dropRegionContext.questionPartId.replaceAll("_", "-");
    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;
    // Looks for all div elements with ids starting with "drop-region-". These are the drop-zones that the component
    // using this hook is charged with rendering.
    const dropZones = htmlDom.querySelectorAll("span[id^='drop-region-']") as NodeListOf<HTMLElement>;
    if (dropZones.length === 0) return [html, () => []];
    for (let i = 0; i < dropZones.length; i++) {
        const width = dropZones[i].dataset.width ?? "100";
        const height = dropZones[i].dataset.height ?? "27";

        switch (dropRegionContext.questionType) {
            case "isaacClozeQuestion": {
                const index = parseInt(dropZones[i].dataset.index ?? "x");
                if (isNaN(index)) {
                    console.error("Drop zone div element has invalid index data attribute!", dropZones[i]);
                    continue;
                }

                const contextIndex = index + dropRegionContext.zoneIds.size;
                dropZones[i].setAttribute("id", `drop-region-${contextIndex}-${safeQuestionId}`);
                dropIds.push({divId: dropZones[i].id, zoneId: `${contextIndex}`, width, height});
                break;
            }
            case "isaacDragAndDropQuestion": {
                const id = dropZones[i].dataset.index;
                dropZones[i].setAttribute("id", `drop-region-${id}-${safeQuestionId}`);
                dropIds.push({divId: dropZones[i].id, zoneId: id ?? "", width, height});
                break;
            }
        }
    }

    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? dropIds.map(({divId, zoneId, width, height}) => 
            <InlineDropRegion
                key={divId}
                rootElement={ref}
                divId={divId}
                zoneId={zoneId}
                emptyWidth={width}
                emptyHeight={height}
            />
        ) : []
    ];
};
