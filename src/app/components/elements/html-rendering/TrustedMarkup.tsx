import React from "react";
import {useRenderKatex} from "./LaTeX";
import {TrustedHtml} from "./TrustedHtml";
import {TrustedMarkdown} from "./TrustedMarkdown";
// @ts-ignore
import {utils} from "remarkable";

export type TrustedMarkupEncoding = "markdown" | "html" | "latex" | "plaintext" | "unknown";
// Encodings:
//  - `markdown`:  renders markdown syntax into HTML, providing placeholders for portal components (glossary terms, cloze question drop-zones).
//                 Besides this preprocessing step, `markdown` encoding does the same as `html`.
//  - `html`:      renders arbitrary HTML, and renders portal components into relevant placeholders.
//  - `latex`:     escapes HTML and renders LaTeX using KaTeX.
//  - `plaintext`: escapes HTML, doesn't do anything other than injecting text into a `span`.
//  - `unknown`:   HTML is escaped, and markup is rendered alongside a warning that the encoding is unknown.
//
// You can pass in an encoding other than these, and the encoding will be treated the same as as `unknown`. However, TS will complain,
// so you will have to cast `string` to `TrustedMarkupEncoding`. Don't do this unless there is no guarantee of the encoding
// value (for example in `IsaacContentValueOrChildren`), the types are there to help!
export const TrustedMarkup = ({markup, encoding, className}: {markup: string; encoding: TrustedMarkupEncoding; className?: string}) => {
    const renderKaTeX = useRenderKatex();

    switch (encoding) {
        case "html":
            return <TrustedHtml html={renderKaTeX(markup)}/>;
        case "markdown":
            return <TrustedMarkdown markdown={renderKaTeX(markup)}/>;
        case "latex":
            const escapedMarkup = utils.escapeHtml(markup);
            return <span dangerouslySetInnerHTML={{__html: renderKaTeX(escapedMarkup)}} className={className} />;
        case "plaintext":
            return <span dangerouslySetInnerHTML={{__html: utils.escapeHtml(markup)}} className={className} />;
        case "unknown":
        default:
            return <div>[CONTENT WITH UNKNOWN ENCODING: <i>{encoding} | {utils.escapeHtml(markup)} </i>]</div>;
    }
};
