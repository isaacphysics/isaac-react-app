import React, {useState} from "react";
import ReactDOMServer from "react-dom/server";
import {Provider, useSelector, useStore} from "react-redux";
import * as RS from "reactstrap";
import {Router} from "react-router-dom";
import {AppState} from "../../state/reducers";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {IsaacGlossaryTerm} from "../content/IsaacGlossaryTerm";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {escapeHtml, replaceEntities} from "remarkable/lib/common/utils";
import {Token} from "remarkable";
import uuid from "uuid";
import {history} from "../../services/history";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

MARKDOWN_RENDERER.renderer.rules.link_open = function(tokens: Token[], idx/* options, env */) {
    let href = escapeHtml(tokens[idx].href || "");
    let localLink = href.startsWith(window.location.origin) || href.startsWith("/") || href.startsWith("mailto:");
    let title = tokens[idx].title ? (' title="' + escapeHtml(replaceEntities(tokens[idx].title || "")) + '"') : '';
    if (localLink) {
        return `<a href="${href}" ${title}>`;
    } else {
        return `<a href="${href}" ${title} target="_blank" rel="noopener nofollow">`;
    }
};

function getTermFromCandidateTerms(candidateTerms: GlossaryTermDTO[]) {
    if (candidateTerms.length === 0) {
        return null;
    } else if (candidateTerms.length === 1) {
        return candidateTerms[0];
    } else {
        console.warn('More than one candidate term was found: ', candidateTerms);
        return candidateTerms[0];
    }
}

export const TrustedMarkdown = ({markdown, expandable}: {markdown: string, expandable?: boolean}) => {
    const store = useStore();

    const glossaryTerms = useSelector((state: AppState) => state && state.glossaryTerms);
    const [componentUuid, setComponentUuid] = useState(uuid.v4().slice(0, 8));

    // This tooltips array is necessary later on: it will contain
    // UncontrolledTooltip elements that cannot be pre-rendered as static HTML.
    const tooltips: JSX.Element[] = [];

    // Matches strings such as [glossary:glossary-demo|boolean-algebra] which MUST be at the beginning of the line.
    // This is used to render the full version of a glossary term using the IsaacGlossaryTerm component.
    const glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;

    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra] and
    // [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"] which CAN be inlined.
    // This is used to produce a hoverable element showing the glossary term, and its definition in a tooltip.
    const glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\s*(?:"(?<text>[A-Za-z0-9 ]+)")?\]/g;

    const glossaryIdsInMarkdown = Array.from(new Set([
        ...Array.from(markdown.matchAll(glossaryBlockRegexp)).filter(m => m.groups && m.groups.id),
        ...Array.from(markdown.matchAll(glossaryInlineRegexp)).filter(m => m.groups && m.groups.id),
    ]));

    if (glossaryTerms && glossaryTerms.length > 0 && glossaryIdsInMarkdown.length > 0) {
        // Markdown can't cope with React components, so we pre-render our component to static HTML, which Markdown will then ignore.
        // This requires a bunch of stuff to be passed down along with the component.
        markdown = markdown.replace(glossaryBlockRegexp, (_match, id) => {
            const term = getTermFromCandidateTerms(glossaryTerms.filter(term => (term.id as string) === id));
            if (term === null) {
                console.error('No valid term for "' + id + '" found among the filtered terms: ', glossaryTerms);
                return "";
            }

            return ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}>
                    <Router history={history}>
                        <IsaacGlossaryTerm doc={term}/>
                    </Router>
                </Provider>
            );
        });

        // This is easier: we replace an inline glossary term with a <span> which is later targeted by ReactStrap's UncontrolledTooltip.
        // The tooltip components can be rendered as regular react objects, so we just add them to an array,
        // and return them inside the JSX.Element that is returned as TrustedMarkdown.
        markdown = markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
            const term = getTermFromCandidateTerms(glossaryTerms.filter(term => (term.id as string) === id));
            if (term === null) {
                console.error('No valid term for "' + id + '" found among the filtered terms: ', glossaryTerms);
                return "";
            }

            const cssFriendlyTermId = (term.id as string).replace(/\|/g, '-');
            const tooltipTargetId = `glossary-${componentUuid}-${cssFriendlyTermId}-${offset}`;
            // This is properly horrible but it works...
            tooltips.push(
                <RS.UncontrolledTooltip placement="bottom" target={tooltipTargetId}>
                    <TrustedMarkdown markdown={term.explanation && term.explanation.value || ''} />
                </RS.UncontrolledTooltip>
            );
            return `<span class="inline-glossary-term" id="${tooltipTargetId}">${text || term.value}</span>`;
        });
    }

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
        <TrustedHtml html={html} expandable={expandable}/>
        {tooltips}
    </div>;
};