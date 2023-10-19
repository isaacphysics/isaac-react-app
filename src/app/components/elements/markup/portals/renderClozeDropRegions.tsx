import { PortalInHtmlHook } from "./utils";
import React, { lazy, useContext } from "react";
import { ClozeDropRegionContext } from "../../../../../IsaacAppTypes";

// This needs to be in a separate file and lazily imported, so that react-beautiful-dnd can be split off from the main bundle.
const InlineDropRegion = lazy(() => import("./InlineDropZones"));

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useClozeDropRegionsInHtml: PortalInHtmlHook = (html) => {
  // If not in a cloze question, don't bother trying to find and render drop-zone divs
  const dropRegionContext = useContext(ClozeDropRegionContext);
  if (!dropRegionContext) return [html, () => []];

  const dropIds: { id: string; index: number; width: string; height: string }[] = [];
  const safeQuestionId = dropRegionContext.questionPartId.replaceAll("_", "-");
  const htmlDom = document.createElement("html");
  htmlDom.innerHTML = html;
  // Looks for all div elements with ids starting with "drop-region-". These are the drop-zones that the component
  // using this hook is charged with rendering.
  const dropZones = htmlDom.querySelectorAll("span[id^='drop-region-']") as NodeListOf<HTMLElement>;
  if (dropZones.length === 0) return [html, () => []];
  for (let i = 0; i < dropZones.length; i++) {
    const index = parseInt(dropZones[i].dataset.index ?? "x");
    const width = dropZones[i].dataset.width ?? "100";
    const height = dropZones[i].dataset.height ?? "27";
    if (isNaN(index)) {
      console.error("Drop zone div element has invalid index data attribute!", dropZones[i]);
      continue;
    }
    dropZones[i].setAttribute("id", `${dropZones[i].id}-${safeQuestionId}`);
    dropIds.push({ id: dropZones[i].id, index, width, height });
  }

  return [
    htmlDom.innerHTML,
    (ref?: HTMLElement) =>
      ref
        ? dropIds.map(({ id, index, width, height }) => (
            <InlineDropRegion
              key={id}
              rootElement={ref}
              id={id}
              index={index}
              emptyWidth={width}
              emptyHeight={height}
            />
          ))
        : [],
  ];
};
