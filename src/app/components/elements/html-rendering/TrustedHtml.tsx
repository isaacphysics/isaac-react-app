import React from "react";
import {PORTAL_HOOKS, usePortalInHtmlHooks, useStatefulElementRef} from "./portals/utils";

// This component renders the HTML given to it inside a React element.
//
// It also handles specific "special" elements produced by `TrustedMarkdown` (i.e. `span` elements that mark inline
// glossary terms). The component produced by an element is rendered alongside the component that contains the
// html of that element (i.e. in this case `tooltips` are rendered next to `ElementType`, whose `dangerouslySetInnerHTML`
// contains the `span`s that those `UncontrolledTooltip`s refer to).
export const TrustedHtml = ({html, className}: {html: string; className?: string}) => {
    const [htmlRef, updateHtmlRef] = useStatefulElementRef<HTMLDivElement>();

    const [modifiedHtml, renderPortalElements] = usePortalInHtmlHooks(html, PORTAL_HOOKS);

    return <>
        <div ref={updateHtmlRef} className={className} dangerouslySetInnerHTML={{__html: modifiedHtml}} />
        {renderPortalElements(htmlRef)}
    </>;
};
