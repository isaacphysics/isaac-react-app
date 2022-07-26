import ReactDOMServer from "react-dom/server";
import {Provider, useStore} from "react-redux";
import {useAppSelector} from "../state/store";
import {Router} from "react-router-dom";
import {history} from "./history";
import {IsaacGlossaryTerm} from "../components/content/IsaacGlossaryTerm";
import * as RS from "reactstrap";
import React, {useRef} from "react";
import {GlossaryTermDTO} from "../../IsaacApiTypes";
import {EXAM_BOARD_NULL_OPTIONS} from "./constants";
import {AppState} from "../state/reducers";
import {Markup} from "../components/elements/markup";
import {v4 as uuid_v4} from "uuid";
import {useUserContext} from "./userContext";

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

export function useGlossaryTermsInMarkdown(markdown: string): [string, JSX.Element[]] {
    // Create a unique id which does not change over the lifecycle of the component
    const componentUuid = useRef(uuid_v4().slice(0, 8)).current;
    const store = useStore();
    const {examBoard} = useUserContext();
    const examBoardTag = !EXAM_BOARD_NULL_OPTIONS.has(examBoard) ? examBoard : "";

    const glossaryTerms = useAppSelector((state: AppState) => state && state.glossaryTerms);

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
        const filteredTerms = glossaryTerms.filter(term => term.examBoard === "" || term.examBoard === examBoard);

        // Markdown can't cope with React components, so we pre-render our component to static HTML, which Markdown will then ignore.
        // This requires a bunch of stuff to be passed down along with the component.
        markdown = markdown.replace(glossaryBlockRegexp, (_match, id) => {
            const term = getTermFromCandidateTerms(filteredTerms.filter(term => (term.id as string) === id || (term.id as string) === `${id}|${examBoardTag}`));
            if (term === null) {
                console.error('No valid term for "' + id + '" found among the filtered terms: ', filteredTerms);
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
        // and return them inside the JSX.Element that is returned as Markup.
        markdown = markdown.replace(glossaryInlineRegexp, (_match, id, text, offset) => {
            const term = getTermFromCandidateTerms(filteredTerms.filter(term => (term.id as string) === id || (term.id as string) === `${id}|${examBoardTag}`));
            if (term === null) {
                console.error('No valid term for "' + id + '" found among the filtered terms: ', filteredTerms);
                return "";
            }

            const cssFriendlyTermId = (term.id as string).replace(/\|/g, '-');
            const tooltipTargetId = `glossary-${componentUuid}-${cssFriendlyTermId}-${offset}`;
            // This is properly horrible but it works...
            tooltips.push(
                <RS.UncontrolledTooltip placement="bottom" target={tooltipTargetId}>
                    <Markup trusted-markup-encoding={"markdown"}>
                        {term.explanation?.value}
                    </Markup>
                </RS.UncontrolledTooltip>
            );
            return `<span class="inline-glossary-term" id="${tooltipTargetId}">${text || term.value}</span>`;
        });
    }

    return [markdown, tooltips];
}
