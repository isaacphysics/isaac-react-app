import React from "react";
import {MARKDOWN_RENDERER} from "../../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
// @ts-ignore
import {Remarkable, utils} from "remarkable";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {compose} from "redux";

MARKDOWN_RENDERER.renderer.rules.link_open = function(tokens: Remarkable.LinkOpenToken[], idx: number/* options, env */) {
    const href = utils.escapeHtml(tokens[idx].href || "");
    const localLink = href.startsWith(window.location.origin) || href.startsWith("/") || href.startsWith("mailto:");
    const title = tokens[idx].title ? (' title="' + utils.escapeHtml(utils.replaceEntities(tokens[idx].title || "")) + '"') : '';
    if (localLink) {
        return `<a href="${href}" ${title}>`;
    } else {
        return `<a href="${href}" ${title} target="_blank" rel="noopener nofollow">`;
    }
};

// This is used to match and render cloze question drop zones into span elements
const renderClozeDropZones = (markdown: string) => {
    // Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
    const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;
    let index = 0;
    return markdown.replace(dropZoneRegex, (_match, params, widthMatch, heightMatch) => {
        const dropId = `drop-region-${index}`;
        const minWidth = widthMatch ? widthMatch.slice("w-".length) + "px" : "100px";
        const minHeight = heightMatch ? heightMatch.slice("h-".length) + "px" : "auto";
        return `<span data-index="${index++}" id="${dropId}" class="d-inline-block" style="min-width: ${minWidth}; min-height: ${minHeight}"></span>`;
    });
}

// This is used to render the full version of a glossary term using the IsaacGlossaryTerm component.
const renderGlossaryBlocks = (markdown: string) => {
    // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
    const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;
    return markdown.replace(glossaryBlockRegexp, (_match, id) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<div data-type="full" id="glossary-term-${cssFriendlyTermId}">Loading glossary...</div>`;
    });
}

// This is used to produce a hoverable element showing the glossary term, and its definition in a tooltip.
const renderInlineGlossaryTerms = (markdown: string) => {
    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
    // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
    const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\s*(?:"(?<text>[A-Za-z0-9 ]+)")?\]/g;
    return markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<span data-type="inline" class="inline-glossary-term" ${text ? `data-text="${text}"` : ""} id="glossary-term-${cssFriendlyTermId}">Loading glossary...</span>`;
    });
}

// RegEx replacements to match Latex inspired Isaac Physics functionality
const regexProcessMarkdown = (markdown: string) => {
    const regexRules = {
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
    };
    if (SITE_SUBJECT === SITE.PHY) {
        Object.assign(regexRules, {
            "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
            "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
        });
    }
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        markdown = markdown.replace(rule, replacement)
    );
    return markdown;
}


// The job of this component is to render standard and Isaac-specific markdown (glossary terms, cloze question
// drop zones) into HTML, which is then passed to `TrustedHTML`. The Isaac-specific markdown must be processed first,
// so that it doesn't get incorrectly rendered with Remarkable (the markdown renderer we use).
export const TrustedMarkdown = ({markdown}: {markdown: string, renderParagraphs?: boolean}) => {
    // This combines all of the above functions for markdown processing.
    const html = compose<string>(
        (s: string) => MARKDOWN_RENDERER.render(s), // Remarkable markdown renderer, processes standard markdown syntax
        regexProcessMarkdown,      //  ^
        renderInlineGlossaryTerms, //  |
        renderGlossaryBlocks,      //  | control flow
        renderClozeDropZones,      //  |
    )(markdown);

    return <TrustedHtml html={html}/>;
};