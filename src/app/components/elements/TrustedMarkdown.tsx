import React from "react";
import {useStore, useSelector, Provider} from "react-redux";
import * as RS from "reactstrap";
import {Router} from "react-router-dom";
import {AppState} from "../../state/reducers";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {IsaacGlossaryTerm} from "../content/IsaacGlossaryTerm";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {escapeHtml, replaceEntities} from "remarkable/lib/common/utils";
import {Token} from "remarkable";
import {history} from "../../services/history";
import {determineExamBoardFrom} from "../../services/examBoard";

import ReactDOMServer from "react-dom/server";

// eslint-disable-next-line @typescript-eslint/camelcase
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

function getTermFromCandidateTerms(candidateTerms: GlossaryTermDTO[]): GlossaryTermDTO {
    if (candidateTerms.length === 0) {
        throw Error();
    } else if (candidateTerms.length === 1) {
        return candidateTerms[0];
    } else {
        console.warn('More than one candidate term was found: ', candidateTerms);
        return candidateTerms[0];
    }
}

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    const store = useStore();
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences || null);
    const examBoard = determineExamBoardFrom(userPreferences);
    const glossaryTerms = useSelector((state: AppState) => {
        return state && state.glossaryTerms;
    });

    // This tooltips array is necessary later on: it will contain
    // UncontrolledTooltip elements that cannot be pre-rendered as static HTML.
    let tooltips: JSX.Element[] = [];

    let filteredTerms: GlossaryTermDTO[] = [];

    // Matches strings such as
    // [glossary:glossary-demo|boolean-algebra]
    // which MUST be at the beginning of the line. This is used to render the
    // full version of a glossary term using the IsaacGlossaryTerm component.
    let glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;
    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra]
    // and [glossary-inline:glossary-demo|boolean-algebra "boolean algebra"]
    // which CAN be inlined. This is used to produce a hoverable element showing
    // the glossary term, and its definition in a tooltip.
    let glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\s*(?:"(?<text>[A-Za-z0-9 ]+)")?\]/g;
    let glossaryIDs: string[] = Array.from(new Set([
        ...Array.from(markdown.matchAll(glossaryBlockRegexp)).map(m => m.groups && m.groups.id || ''),
        ...Array.from(markdown.matchAll(glossaryInlineRegexp)).map(m => m.groups && m.groups.id || ''),
    ]));
    if (glossaryTerms && glossaryTerms.length > 0 && glossaryIDs.length > 0) {
        filteredTerms = glossaryTerms.filter(t => {
            let id = t.id || '';
            return glossaryIDs.some(e => id.indexOf(e) === 0) && (t.examBoard === "" || t.examBoard === examBoard);
        });
        // Markdown can't cope with React components, so we pre-render our
        // component to static HTML, which Markdown will then ignore. This
        // requires a bunch of stuff to be passed down along with the component.
        markdown = markdown.replace(glossaryBlockRegexp, (_match, id: string) => {
            let candidateTerms = filteredTerms.filter(term => (term.id || '').indexOf(id) === 0);
            let term: GlossaryTermDTO;
            try {
                term = getTermFromCandidateTerms(candidateTerms);
            } catch (e) {
                console.error('No valid term found among the candidates. Here are the filtered terms: ', filteredTerms);
                return '';
            }
            let string = ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}>
                    <Router history={history}>
                        <IsaacGlossaryTerm doc={term} />
                    </Router>
                </Provider>
            );
            return string;
        });
        // This is easier: we replace an inline glossary term with a <span>
        // which is later targetted by Reactstrap's UncontrolledTooltip.
        // The tooltip components can be rendered as regular react objects, so
        // we just add them to an array, and return them inside the JSX.Element
        // that is returned as TrustedMarkdown.
        let i = 0; // Uniquify HTML ids for UncontrolledTooltip to work...
                   // ... but don't uniquify them too much with random numbers.
        markdown = markdown.replace(glossaryInlineRegexp, (_match, id: string, text: string) => {
            let candidateTerms = filteredTerms.filter(term => (term.id || '').indexOf(id) === 0);
            let term: GlossaryTermDTO;
            try {
                term = getTermFromCandidateTerms(candidateTerms);
            } catch (e) {
                console.error('No valid term found among the candidates. Here are the filtered terms: ', filteredTerms);
                return '';
            }
            let elementId = `glossary-term-id-${term && term.id && term.id.replace(/\|/g, '-')}-${++i}`;
            let displayString = text || term.value;
            // This is properly horrible but it works...
            tooltips.push(
                <RS.UncontrolledTooltip placement="bottom" target={elementId}>
                    <TrustedMarkdown markdown={term.explanation && term.explanation.value || ''} />
                </RS.UncontrolledTooltip>
            );
            let string = `<span class="inline-glossary-term" id="${elementId}">${displayString}</span>`;
            return string;
        });
    }

    // RegEx replacements to match Latex inspired Isaac Physics functionality
    const regexRules = {
        "<span isaac-figure-ref='$2'></span>": /(~D)?\\ref{([^}]*)}(~D)?/g,
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
        "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
        "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
    };
    let regexProcessedMarkdown = markdown;
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        regexProcessedMarkdown = regexProcessedMarkdown.replace(rule, replacement)
    );

    const html = MARKDOWN_RENDERER.render(regexProcessedMarkdown);
    return <div>
        <TrustedHtml html={html} />
        {tooltips}
    </div>;
};
