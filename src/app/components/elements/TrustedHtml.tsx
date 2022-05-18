import React from "react";
import {PORTAL_HOOKS, usePortalInHtmlHooks, useStatefulElementRef} from "./portals/utils";
import {useRenderKatex} from "./LaTeX";

// This component renders the HTML given to it inside a React element.
//
// It also handles specific "special" elements produced by `TrustedMarkdown` (i.e. `span` elements that mark inline
// glossary terms). The component produced by an element is rendered alongside the component that contains the
// html of that element (i.e. in this case `tooltips` are rendered next to `ElementType`, whose `dangerouslySetInnerHTML`
// contains the `span`s that those `UncontrolledTooltip`s refer to).
export const TrustedHtml = ({html, span, className, isMarkdown}: {html: string; span?: boolean; className?: string; isMarkdown?: boolean}) => {
    const [htmlRef, updateHtmlRef] = useStatefulElementRef<HTMLDivElement>();

    // If KaTeX was already processed by `TrustedMarkdown`, then don't process it again
    const renderKatex = useRenderKatex();
    const katexHtml = isMarkdown ? html : renderKatex(html);

    const [modifiedHtml, renderPortalElements] = usePortalInHtmlHooks(katexHtml, PORTAL_HOOKS);

    const ElementType = span ? "span" : "div";
    return <>
        <ElementType ref={updateHtmlRef} className={className} dangerouslySetInnerHTML={{__html: modifiedHtml}} />
        {renderPortalElements(htmlRef)}
    </>;
};
