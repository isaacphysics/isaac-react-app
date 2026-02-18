import {PortalInHtmlHook} from "./utils";
import React, {lazy, useCallback, useContext, useState} from "react";
import {DragAndDropRegionContext} from "../../../../../IsaacAppTypes";
import isEqual from "lodash/isEqual";

// This needs to be in a separate file and lazily imported, so that @hello-pangea/dnd can be split off from the main bundle.
const InlineDropRegion = lazy(() => import("./InlineDropZones"));

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useClozeDropRegionsInHtml: PortalInHtmlHook = () => {
    // If not in a cloze question, don't bother trying to find and render drop-zone divs
    const dropRegionContext = useContext(DragAndDropRegionContext);

    const [dropIds, setDropIds] = useState<{ divId: string; zoneId: string; width: string; height: string; }[]>([]);

    const modifyHtml = useCallback((html: string): string => {
        if (!dropRegionContext) return html;

        const newDropIds: { divId: string; zoneId: string; width: string; height: string; }[] = [];
        const safeQuestionId = dropRegionContext.questionPartId.replaceAll("_", "-");
        const htmlDom = document.createElement("html");
        htmlDom.innerHTML = html;
        // Looks for all div elements with ids starting with "drop-region-". These are the drop-zones that the component
        // using this hook is charged with rendering.
        const dropZones = htmlDom.querySelectorAll("span[id^='drop-region-']") as NodeListOf<HTMLElement>;
        if (dropZones.length === 0) return html;
        for (let i = 0; i < dropZones.length; i++) {
            const width = (dropZones[i].dataset.width ?? "100") + "px";
            const height = (dropZones[i].dataset.height ?? "27") + "px";

            switch (dropRegionContext.questionType) {
                case "isaacClozeQuestion": {
                    const index = parseInt(dropZones[i].dataset.index ?? "x");
                    if (isNaN(index)) {
                        console.error("Drop zone div element has invalid index data attribute!", dropZones[i]);
                        continue;
                    }

                    dropZones[i].setAttribute("id", `drop-region-${index}-${safeQuestionId}`);
                    newDropIds.push({divId: dropZones[i].id, zoneId: `${index}`, width, height});
                    break;
                }
                case "isaacDragAndDropQuestion": {
                    const id = dropZones[i].dataset.index;
                    dropZones[i].setAttribute("id", `drop-region-${id}-${safeQuestionId}`);
                    newDropIds.push({divId: dropZones[i].id, zoneId: id ?? "", width, height});
                    break;
                }
            }
        }

        setDropIds(d => {
            if (isEqual(d, newDropIds)) return d;
            return newDropIds;
        });

        return htmlDom.innerHTML;
    }, [dropRegionContext]);

    const portalFunc = useCallback((ref?: HTMLElement): JSX.Element[] => {
        return ref 
            ? dropIds.map(({divId, zoneId, width, height}) => 
                <InlineDropRegion
                    key={divId}
                    rootElement={ref}
                    divId={divId}
                    zoneId={zoneId}
                    emptyWidth={width}
                    emptyHeight={height}
                />
            ) 
            : [];
    }, [dropIds]);

    return [
        modifyHtml,
        portalFunc
    ];
};
