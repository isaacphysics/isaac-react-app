import React from "react";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
// @ts-ignore
import {Remarkable, utils} from "remarkable";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

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

// The job of this component is to render standard and Isaac-specific markdown (glossary terms, cloze question
// drop zones) into HTML, which is then passed to `TrustedHTML`. The Isaac-specific markdown must be processed first,
// so that it doesn't get incorrectly rendered with Remarkable (the markdown renderer we use).
export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
    // This is used to render the full version of a glossary term using the IsaacGlossaryTerm component.
    const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;

    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
    // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
    // This is used to produce a hoverable element showing the glossary term, and its definition in a tooltip.
    const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\s*(?:"(?<text>[A-Za-z0-9 ]+)")?\]/g;

    markdown = markdown.replace(glossaryBlockRegexp, (_match, id) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<span data-type="full" id="glossary-term-${cssFriendlyTermId}">Loading glossary...</span>`;
    });
    markdown = markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<span data-type="inline" class="inline-glossary-term" ${text ? `data-text="${text}"` : ""} id="glossary-term-${cssFriendlyTermId}">Loading glossary...</span>`;
    });

    // RegEx replacements to match Latex inspired Isaac Physics functionality
    const regexRules = {
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
    };
    if (SITE_SUBJECT === SITE.PHY) {
        Object.assign(regexRules, {
            "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
            "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
        });
    }
    let regexProcessedMarkdown = markdown;
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        regexProcessedMarkdown = regexProcessedMarkdown.replace(rule, replacement)
    );

    const html = MARKDOWN_RENDERER.render(regexProcessedMarkdown);
    return <div>
        <TrustedHtml html={html}/>
    </div>;
};