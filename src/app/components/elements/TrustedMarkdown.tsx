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

    let tooltips: Array<any> = [];
    let terms: any = {};
    // TODO Could be using String::matchAll() if we had a decent polyfill...
    let glossaryBlockRegexp = /^\[glossary:(?<id>[a-z-|]+?)\]/gm;
    let glossaryInlineRegexp = /\[glossary-inline:(?<id>[a-z-|]+?)\]/gm;
    let glossaryIDs: Array<string> = [];
    let m;
    while ((m = glossaryBlockRegexp.exec(markdown)) !== null) {
        glossaryIDs.push(m.groups && m.groups.id || ''); // bit stupid but hey, Typescript needs pleasing...
    }
    while ((m = glossaryInlineRegexp.exec(markdown)) !== null) {
        glossaryIDs.push(m.groups && m.groups.id || '');
    }
    if (glossaryTerms && glossaryTerms.length > 0 && glossaryIDs && glossaryIDs.length > 0) {
        terms = Object.assign({}, ...glossaryTerms.filter(t => {
            return glossaryIDs.includes(t.id || '')
        }).map(
            (t: GlossaryTermDTO) => {
                if (t.id) {
                    return { [t.id]: t };
                }
            }
        ));
        markdown = markdown.replace(glossaryBlockRegexp, (_match, id: string) => {
            let string = ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}>
                    <Router history={history}>
                        <IsaacGlossaryTerm doc={terms[id]} />
                    </Router>
                </Provider>
            );
            return string;
        });
        markdown = markdown.replace(glossaryInlineRegexp, (_match, id: string) => {
            let term = terms[id];
            // This is properly horrible but it works...
            tooltips.push(
                <RS.UncontrolledTooltip placement="bottom" target={`glossary-term-id-${term.id.replace('|', '-')}`}>
                    <TrustedMarkdown markdown={term.explanation.value} />
                </RS.UncontrolledTooltip>
            );
            let string = `<span class="inline-glossary-term" id="glossary-term-id-${term.id.replace('|', '-')}">${term.value}</span>`;
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
