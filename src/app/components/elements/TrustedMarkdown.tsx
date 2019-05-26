import React from "react";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
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
