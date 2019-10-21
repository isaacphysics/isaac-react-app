import React, { useEffect, useState } from "react";
import {useDispatch, useStore, useSelector, ReactReduxContext, Provider} from "react-redux";
import {AppState} from "../../state/reducers";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {IsaacGlossaryTerm} from "../content/IsaacGlossaryTerm";
import {fetchGlossaryTerms} from "../../state/actions";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {escapeHtml, replaceEntities} from "remarkable/lib/common/utils";
import {Token} from "remarkable";

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

const stateToProps = (state: AppState) => {
    const glossaryTerms = state && state.glossaryTerms;
    return glossaryTerms ? { glossaryTerms } : {};
}

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    const dispatch = useDispatch();
    const store = useStore();
    const glossaryTerms = useSelector((state: AppState) => {
        return state && state.glossaryTerms;
    });

    let terms: any = {};
    if (glossaryTerms) {
        terms = Object.assign({}, ...glossaryTerms.map(
            (t: GlossaryTermDTO) => {
                if (t.id) {
                    // let el = <IsaacGlossaryTerm doc={t} />;
                    // let string = ReactDOMServer.renderToString(el);
                    return { [t.id]: t };
                }
            }
        ));
        let r = /^\[glossary:([a-z-|]+?)\]/gm;
        markdown = markdown.replace(r, (_match, id: string) => {
            let string = ReactDOMServer.renderToStaticMarkup(
                <Provider store={store}><IsaacGlossaryTerm doc={terms[id]} /></Provider>
            );
            return string;
        });
    }

    useEffect(() => {
        if (glossaryTerms) {
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
    return <TrustedHtml html={html} />;
};
