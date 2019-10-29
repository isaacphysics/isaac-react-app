import React, { useEffect, useState } from "react";
import {useDispatch, useStore, useSelector, ReactReduxContext, Provider} from "react-redux";
import * as RS from "reactstrap";
import {Router} from "react-router-dom";
import {AppState} from "../../state/reducers";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {IsaacGlossaryTerm} from "../content/IsaacGlossaryTerm";
import {fetchGlossaryTerms} from "../../state/actions";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {escapeHtml, replaceEntities} from "remarkable/lib/common/utils";
import {Token} from "remarkable";
import {history} from "../../services/history";

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

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    const dispatch = useDispatch();
    const store = useStore();
    const glossaryTerms = useSelector((state: AppState) => {
        return state && state.glossaryTerms;
    });

    // This tooltips array is necessary later on: it will contain
    // UncontrolledTooltip elements that cannot be pre-rendered as static HTML.
    let tooltips: Array<JSX.Element> = [];

    let filteredTerms: { [id: string]: GlossaryTermDTO } = {};

    // Matches strings such as
    // [glossary:glossary-demo|boolean-algebra]
    // which MUST be at the beginning of the line. This is used to render the
    // full version of a glossary term using the IsaacGlossaryTerm component.
    let glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;
    // Matches strings such as [glossary-inline:glossary-demo|boolean-algebra]
    // which CAN be inlined. This is used to produce a hoverable element showing
    // the glossary term, and its definition in a tooltip.
    let glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\]/g;
    let glossaryIDs: Array<string> = [
        ...Array.from(markdown.matchAll(glossaryBlockRegexp)).map(m => m.groups && m.groups.id || ''),
        ...Array.from(markdown.matchAll(glossaryInlineRegexp)).map(m => m.groups && m.groups.id || ''),
    ];
    if (glossaryTerms && glossaryTerms.length > 0 && glossaryIDs && glossaryIDs.length > 0) {
        filteredTerms = Object.assign({}, ...glossaryTerms.filter(t => {
            return glossaryIDs.includes(t.id || '')
        }).map(
            (t: GlossaryTermDTO) => {
                if (t.id) {
                    return { [t.id]: t };
                }
            }
        ));
        // Markdown can't cope with React components, so we pre-render our
        // component to static HTML, which Markdown will then ignore. This
        // requires a bunch of stuff to be passed down along with the component.
        markdown = markdown.replace(glossaryBlockRegexp, (_match, id: string) => {
            let string = ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}>
                    <Router history={history}>
                        <IsaacGlossaryTerm doc={filteredTerms[id]} />
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
        markdown = markdown.replace(glossaryInlineRegexp, (_match, id: string) => {
            let term = filteredTerms[id];
            // This is properly horrible but it works...
            tooltips.push(
                <RS.UncontrolledTooltip placement="bottom" target={`glossary-term-id-${term && term.id && term.id.replace('|', '-')}`}>
                    <TrustedMarkdown markdown={term.explanation && term.explanation.value || ''} />
                </RS.UncontrolledTooltip>
            );
            let string = `<span class="inline-glossary-term" id="glossary-term-id-${term && term.id && term.id.replace('|', '-')}">${term.value}</span>`;
            return string;
        });
    }

    useEffect(() => {
        if (!glossaryTerms) {
            dispatch(fetchGlossaryTerms());
        }
    }, [glossaryTerms]);
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
