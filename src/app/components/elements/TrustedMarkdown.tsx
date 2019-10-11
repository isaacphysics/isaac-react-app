import React, { useEffect } from "react";
import {useDispatch, useStore} from "react-redux";
import {AppState} from "../../state/reducers";
import {MARKDOWN_RENDERER} from "../../services/constants";
import {TrustedHtml} from "./TrustedHtml";
import {IsaacGlossaryTerm} from "../content/IsaacGlossaryTerm";
import {api} from '../../services/api';
import {fetchGlossaryTerms} from "../../state/actions";
import {GlossaryTermDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState) => {
    const glossaryTerms = state && state.glossaryTerms;
    return glossaryTerms ? { glossaryTerms } : {};
}

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    const dispatch = useDispatch();
    const store = useStore();
    const state = store.getState();

    useEffect(() => {
        dispatch(fetchGlossaryTerms());
        debugger;
        console.log(state.glossaryTerms);
        
        // let r = /^\[glossary:([a-z-|]+?)\]/gm;
        // let m = null;
        // while ((m = r.exec(markdown)) !== null) {
        //     console.log(m);
        // }
    });
    // RegEx replacements to match Latex inspired Isaac Physics functionality
    const regexRules = {
        "<span isaac-figure-ref='$2'></span>": /(~D)?\\ref{([^}]*)}(~D)?/g,
        "[$1]($2)": /\\link{([^}]*)}{([^}]*)}/g,
        "[**Glossary**](/glossary)": /\*\*Glossary\*\*/g,
        "[**Concepts**](/concepts)": /\*\*Concepts\*\*/g,
        // "GLOSSARY TERM: $1": /^\[glossary:([a-z-|]+?)\]/gm,
    };
    let regexProcessedMarkdown = markdown;
    Object.entries(regexRules).forEach(([replacement, rule]) =>
        regexProcessedMarkdown = regexProcessedMarkdown.replace(rule, replacement)
    );

    // let glossaryBlockRegex = /^\[glossary:([a-z-|]+?)\]/gm
    // let glossaryMatches = null;
    // let glossaryTerms = [];
    // while (glossaryMatches = glossaryBlockRegex.exec(regexProcessedMarkdown)) {
    //     console.log(glossaryMatches);
    // }

    const html = MARKDOWN_RENDERER.render(regexProcessedMarkdown);
    return <TrustedHtml html={html} />;
};
