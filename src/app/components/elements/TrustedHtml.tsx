import React, {useContext} from "react";
import {useKatex} from "./LaTeX";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {useGlossaryTermsInHtml} from "./portals/GlossaryTerms";
import {useAccessibleTablesInHtml} from "./portals/Tables";
import {useStatefulElementRef} from "./portals/utils";
import {useClozeDropRegionsInHtml} from "./portals/InlineDropZones";
import {ClozeDropRegionContext} from "../../../IsaacAppTypes";

// TODO move this into TrustedMarkdown and require all cloze questions to be markdown (requires editor change)
// Renders cloze question drop-zones (turning them into elements)
const useRenderClozeDropZones = (html: string) => {
    // If not in a cloze question, don't bother trying to find and render drop-zones
    const dropRegionContext = useContext(ClozeDropRegionContext);
    if (!dropRegionContext) return html;

    let index = 0;
    // Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
    // Used to match and render cloze question drop zones into divs
    const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;
    const safeQuestionId = dropRegionContext.questionPartId.replaceAll("_", "-");
    return html.replace(dropZoneRegex, (_match, params, widthMatch, heightMatch, offset) => {
        const dropId = `drop-region-${index}-${safeQuestionId}`;
        const minWidth = widthMatch ? widthMatch.slice("w-".length) + "px" : "100px";
        const minHeight = heightMatch ? heightMatch.slice("h-".length) + "px" : "auto";
        return `<div data-index="${index++}" id="${dropId}" class="d-inline-block" style="min-width: ${minWidth}; min-height: ${minHeight}"></div>`;
    });
}

// This component renders the HTML given to it inside a React element.
//
// It also handles specific "special" elements produced by `TrustedMarkdown` (i.e. `span` elements that mark inline
// glossary terms). The component produced by an element is rendered alongside the component that contains the
// html of that element (i.e. in this case `tooltips` are rendered next to `ElementType`, whose `dangerouslySetInnerHTML`
// contains the `span`s that those `UncontrolledTooltip`s refer to).
export const TrustedHtml = ({html, span, className}: {html: string; span?: boolean; className?: string}) => {
    const [htmlRef, updateHtmlRef] = useStatefulElementRef<HTMLDivElement>();

    const katexHtml = useKatex(html);

    const htmlWithRenderedDropZones = useRenderClozeDropZones(katexHtml);

    const {htmlWithModifiedTables, renderTables} = useAccessibleTablesInHtml(htmlWithRenderedDropZones);
    const {htmlWithDropZones, renderDropZones} = useClozeDropRegionsInHtml(htmlWithModifiedTables);
    const {htmlWithGlossaryTerms, tooltips, renderGlossaryTerms} = useGlossaryTermsInHtml(htmlWithDropZones);

    const ElementType = span ? "span" : "div";
    return <>
        <ElementType ref={updateHtmlRef} className={className} dangerouslySetInnerHTML={{__html: htmlWithGlossaryTerms}} />
        {renderTables(htmlRef)}
        {renderGlossaryTerms(htmlRef)}
        {renderDropZones(htmlRef)}
        {tooltips}
    </>;
};
