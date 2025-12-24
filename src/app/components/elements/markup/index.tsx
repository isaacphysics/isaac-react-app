import React from "react";
import {useRenderKatex} from "./latexRendering";
import {renderRemarkableMarkdown, regexProcessMarkdown, renderInlineGlossaryTerms, renderGlossaryBlocks, renderClozeDropZones, renderInlineQuestionPartZones, renderDndDropZones} from "./markdownRendering";
// @ts-ignore
import {utils} from "remarkable";
import {usePortalsInHtml, useStatefulElementRef} from "./portals/utils";
import {compose} from "redux";
import {isDefined} from "../../../services";
import { selectors, useAppSelector } from "../../../state";

// This component renders the HTML given to it inside a React element.
//
// It also handles specific "special" elements produced by `TrustedMarkdown` (i.e. `span` elements that mark inline
// glossary terms). The component produced by an element is rendered alongside the component that contains the
// html of that element (i.e. in this case `tooltips` are rendered next to `ElementType`, whose `dangerouslySetInnerHTML`
// contains the `span`s that those `UncontrolledTooltip`s refer to).
const TrustedHtml = ({html, className}: {html: string; className?: string}) => {
    const [htmlRef, updateHtmlRef] = useStatefulElementRef<HTMLDivElement>();

    const [modifiedHtml, renderPortalElements] = usePortalsInHtml(html);

    return <>
        <div ref={updateHtmlRef} className={className} dangerouslySetInnerHTML={{__html: modifiedHtml}} />
        {renderPortalElements(htmlRef)}
    </>;
};

// The job of this component is to render standard and Isaac-specific markdown (glossary terms, cloze question
// drop zones) into HTML, which is then passed to `TrustedHTML`. The Isaac-specific markdown must be processed first,
// so that it doesn't get incorrectly rendered with Remarkable (the markdown renderer we use).
const TrustedMarkdown = ({markdown, className}: {markdown: string, renderParagraphs?: boolean, className?: string}) => {
    const renderKatex = useRenderKatex();
    const pageContext = useAppSelector(selectors.pageContext.context);

    // This combines all of the above functions for markdown processing.
    const html = compose<string>(
        renderDndDropZones,                // ^
        renderClozeDropZones,              // |
        renderInlineQuestionPartZones,     // |
        renderKatex,                       // |
        renderRemarkableMarkdown,          // | Remarkable markdown renderer, processes standard markdown syntax
        regexProcessMarkdown(pageContext), // |
        renderInlineGlossaryTerms,         // |
        renderGlossaryBlocks               // |
    )(markdown);                           // control flow

    return <TrustedHtml html={html} className={className}/>;
};

// --- Types for the Markup component ---

type StringNot<X extends string, Y> =
    X extends Y ? never :
        string extends X ? never : X;

interface BaseMarkupProps {
    className?: string;
    children: string | undefined;
    forceMathsAltText?: boolean;
}

type MarkupProps<T extends string> = {
    encoding: StringNot<T, "markdown" | "html"> | undefined;
    "trusted-markup-encoding"?: never;
} & BaseMarkupProps

type TrustedMarkupProps = {
    encoding?: never;
    "trusted-markup-encoding": string | undefined;
} & BaseMarkupProps;

// Encodings:
//  - `markdown`:  renders markdown syntax into HTML, providing placeholders for portal components (glossary terms, cloze question drop-zones).
//                 Besides this preprocessing step, `markdown` encoding does the same as `html`.
//  - `html`:      renders LaTeX using KaTeX, renders arbitrary HTML, and renders portal components into relevant placeholders.
//  - `latex`:     escapes HTML and renders LaTeX using KaTeX.
//  - `plaintext`: escapes HTML, doesn't do anything other than injecting text into a `span`.
//  - `unknown`:   HTML is escaped, and markup is rendered alongside a warning that the encoding is unknown.
//
// You can pass in an encoding other than these, and the encoding will be treated the same as as `unknown`.
export function Markup<T extends string>({encoding, "trusted-markup-encoding": trustedMarkupEncoding, forceMathsAltText, className, children}: MarkupProps<T> | TrustedMarkupProps) {
    const renderKaTeX = useRenderKatex(forceMathsAltText);

    if (!isDefined(children)) return null;

    switch (encoding ?? trustedMarkupEncoding) {
        case "html":
            return <TrustedHtml html={renderKaTeX(children)}/>;
        case "markdown":
            return <TrustedMarkdown markdown={children} className={className}/>;
        case "latex":
            const escapedMarkup = utils.escapeHtml(children);
            return <span dangerouslySetInnerHTML={{__html: renderKaTeX(escapedMarkup)}} className={className} />;
        case "plaintext":
            return <span className={className}>{utils.escapeHtml(children)}</span>;
        case "unknown":
        default:
            return <div>[CONTENT WITH UNKNOWN ENCODING: <i>{encoding} | {utils.escapeHtml(children)} </i>]</div>;
    }
}
