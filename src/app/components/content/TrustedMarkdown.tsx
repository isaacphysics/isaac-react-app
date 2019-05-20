import React from "react";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {

    // TODO MT add these regex replaces
    // Showdown.extensions.refs = function(_converter) {
    //     return [{
    //         type: "lang",
    //         regex: '(~D)?\\\\ref{([^}]*)}(~D)?',
    //         replace: '<span isaac-figure-ref="$2"></span>',
    //     }];
    // };
    //
    // Showdown.extensions.links = function(_converter) {
    //     return [{
    //         type: "lang",
    //         regex: '\\\\link{([^}]*)}{([^}]*)}',
    //         replace: '[$1]($2)',
    //     }]
    // };
    //
    // Showdown.extensions.glossary = function(_converter) {
    //     return [{
    //         type: "lang",
    //         regex: '\\*\\*Glossary\\*\\*',
    //         replace: '[**Glossary**](/glossary)',
    //     }];
    // };
    //
    // Showdown.extensions.concepts = function(_converter) {
    //     return [{
    //         type: "lang",
    //         regex: '\\*\\*Concepts\\*\\*',
    //         replace: '[**Concepts**](/concepts)',
    //     }];
    // };

    const html = MARKDOWN_RENDERER.render(markdown);
    return <TrustedHtml html={html} />;
};
