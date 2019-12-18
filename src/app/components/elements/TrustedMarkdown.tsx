import React from "react";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {escapeHtml, replaceEntities} from "remarkable/lib/common/utils";
import {Token} from "remarkable";

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
    // RegEx replacements to match Latex inspired Isaac Physics functionality
    const regexRules = {
        "<span isaac-figure-ref='$2'></span>": /(~D)?\\ref{([^}]*)}(~D)?/g,
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
        "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
        // "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
    };
    let regexProcessedMarkdown = markdown;
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        regexProcessedMarkdown = regexProcessedMarkdown.replace(rule, replacement)
    );

    const html = MARKDOWN_RENDERER.render(regexProcessedMarkdown);
    return <TrustedHtml html={html} />;
};
