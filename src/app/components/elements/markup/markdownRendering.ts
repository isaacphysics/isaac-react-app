import { dropZoneRegex, isDefined, MARKDOWN_RENDERER } from "../../../services";
// @ts-ignore
import { Remarkable, utils } from "remarkable";

MARKDOWN_RENDERER.renderer.rules.link_open = function (
  tokens: Remarkable.LinkOpenToken[],
  idx: number /* options, env */,
) {
  const href = utils.escapeHtml(tokens[idx].href || "");
  const localLink =
    href.startsWith(window.location.origin) ||
    href.startsWith("/") ||
    href.startsWith("mailto:") ||
    href.startsWith("#");
  const title = tokens[idx].title
    ? ' title="' + utils.escapeHtml(utils.replaceEntities(tokens[idx].title || "")) + '"'
    : "";
  if (localLink) {
    return `<a href="${href}" ${title}>`;
  } else {
    return `<a href="${href}" ${title} target="_blank" rel="noopener nofollow">`;
  }
};
export const renderRemarkableMarkdown = (markdown: string) => MARKDOWN_RENDERER.render(markdown);

// This is used to match and render cloze question drop zones into span elements
export const renderClozeDropZones = (markdown: string) => {
  // First calculate a reference count for reserved indexes
  const reservedIndices: Map<number, number> = new Map();
  const dropZoneMatches = Array.from(markdown.matchAll(dropZoneRegex));
  for (const match of dropZoneMatches) {
    if (match.groups) {
      const index = parseInt(match.groups.index);
      if (!isNaN(index)) reservedIndices.set(index, 1 + (reservedIndices.get(index) ?? 0));
    }
  }

  let nonReservedIndex = 0;
  return markdown.replace(dropZoneRegex, (_match, params, indexMatch, widthMatch, heightMatch) => {
    const width = widthMatch ? widthMatch.slice("w-".length) : "100";
    const height = heightMatch ? heightMatch.slice("h-".length) : "27";
    const manualIndex: number | undefined = indexMatch ? parseInt(indexMatch.slice("i-".length)) : undefined;
    let usingManualIndex = isDefined(manualIndex) && !isNaN(manualIndex) && manualIndex < dropZoneMatches.length;
    if (usingManualIndex && (reservedIndices.get(manualIndex as number) as number) > 1) {
      usingManualIndex = false;
      reservedIndices.set(manualIndex as number, (reservedIndices.get(manualIndex as number) as number) - 1);
    }
    const index = usingManualIndex ? manualIndex : nonReservedIndex++;
    while (reservedIndices.has(nonReservedIndex)) nonReservedIndex++;
    const dropId = `drop-region-${index}`;
    return `<span data-index="${index}" id="${dropId}" data-width="${width}" data-height="${height}" class="d-inline-block"></span>`;
  });
};

// This is used to render the full version of a glossary term using the IsaacGlossaryTerm component.
export const renderGlossaryBlocks = (markdown: string) => {
  // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
  const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z0-9-|]+?)\]/gm;
  return markdown.replace(glossaryBlockRegexp, (_match, id) => {
    const cssFriendlyTermId = id.replace(/\|/g, "-");
    return `<div data-type="full" id="glossary-term-${cssFriendlyTermId}">Loading glossary...</div>`;
  });
};

// This is used to produce a hoverable element showing the glossary term, and its definition in a tooltip.
export const renderInlineGlossaryTerms = (markdown: string) => {
  // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
  // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
  const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z0-9-|]+?)\s*(?:"(?<text>[A-Za-z0-9-() ]+)")?\]/g;
  return markdown.replace(glossaryInlineRegexp, (_match, id, text) => {
    const cssFriendlyTermId = id.replace(/\|/g, "-");
    return `<span data-type="inline" class="inline-glossary-term" ${
      text ? `data-text="${text}"` : ""
    } id="glossary-term-${cssFriendlyTermId}">Loading glossary...</span>`;
  });
};

// RegEx replacements to match Latex inspired Isaac Physics functionality
export const regexProcessMarkdown = (markdown: string) => {
  const regexRules = {
    "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
  };
  Object.entries(regexRules).forEach(([replacement, rule]) => (markdown = markdown.replace(rule, replacement)));
  return markdown;
};
