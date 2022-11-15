import {isPhy, MARKDOWN_RENDERER} from "../../../services";
// @ts-ignore
import {Remarkable, utils} from "remarkable";

// Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
export const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;

MARKDOWN_RENDERER.renderer.rules.link_open = function(tokens: Remarkable.LinkOpenToken[], idx: number/* options, env */) {
    const href = utils.escapeHtml(tokens[idx].href || "");
    const localLink = href.startsWith(window.location.origin) || href.startsWith("/") || href.startsWith("mailto:") || href.startsWith("#");
    const title = tokens[idx].title ? (' title="' + utils.escapeHtml(utils.replaceEntities(tokens[idx].title || "")) + '"') : '';
    if (localLink) {
        return `<a href="${href}" ${title}>`;
    } else {
        return `<a href="${href}" ${title} target="_blank" rel="noopener nofollow">`;
    }
};
export const renderRemarkableMarkdown = (markdown: string) => MARKDOWN_RENDERER.render(markdown);

// This is used to match and render cloze question drop zones into span elements
export const renderClozeDropZones = (markdown: string) => {
    let index = 0;
    return markdown.replace(dropZoneRegex, (_match, params, widthMatch, heightMatch) => {
        const dropId = `drop-region-${index}`;
        const width = widthMatch ? widthMatch.slice("w-".length) : "100";
        const height = heightMatch ? heightMatch.slice("h-".length) : "27";
        return `<span data-index="${index++}" id="${dropId}" data-width="${width}" data-height="${height}" class="d-inline-block"></span>`;
    });
}

// This is used to render the full version of a glossary term using the IsaacGlossaryTerm component.
export const renderGlossaryBlocks = (markdown: string) => {
    // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
    const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z0-9-|]+?)\]/gm;
    return markdown.replace(glossaryBlockRegexp, (_match, id) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<div data-type="full" id="glossary-term-${cssFriendlyTermId}">Loading glossary...</div>`;
    });
}

// This is used to produce a hoverable element showing the glossary term, and its definition in a tooltip.
export const renderInlineGlossaryTerms = (markdown: string) => {
    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
    // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
    const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z0-9-|]+?)\s*(?:"(?<text>[A-Za-z0-9-() ]+)")?\]/g;
    return markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
        const cssFriendlyTermId = id.replace(/\|/g, '-');
        return `<span data-type="inline" class="inline-glossary-term" ${text ? `data-text="${text}"` : ""} id="glossary-term-${cssFriendlyTermId}">Loading glossary...</span>`;
    });
}

// RegEx replacements to match Latex inspired Isaac Physics functionality
export const regexProcessMarkdown = (markdown: string) => {
    const regexRules = {
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
    };
    if (isPhy) {
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