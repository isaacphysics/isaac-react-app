import {GlossaryTermDTO} from "../../../../../IsaacApiTypes";
import React, {useState} from "react";
import ReactDOM from "react-dom";
import {IsaacGlossaryTerm} from "../../../content/IsaacGlossaryTerm";
import {useAppSelector, AppState, selectors} from "../../../../state";
import {v4 as uuid_v4} from "uuid";
import {UncontrolledTooltip} from "reactstrap";
import {PortalInHtmlHook} from "./utils";
import {Markup} from "../index";

const GlossaryTerm = ({term, id, rootElement}: {term: GlossaryTermDTO, id: string, rootElement: HTMLElement}) => {
    const parentElement = rootElement.querySelector(`#${id}`);
    if (parentElement) {
        return ReactDOM.createPortal(
            <IsaacGlossaryTerm doc={term} key={id} inPortal/>,
            parentElement
        );
    }
    return null;
}

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

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useGlossaryTermsInHtml: PortalInHtmlHook = (html) => {
    const glossaryTerms = useAppSelector((state: AppState) => state && state.glossaryTerms);
    const segueEnvironment = useAppSelector(selectors.segue.environmentOrUnknown);
    const [componentUuid] = useState(uuid_v4().slice(0, 8));

    if (!glossaryTerms) return [html, () => []];

    const tooltips: JSX.Element[] = [];
    const fullTermContainers: {id: string; term: GlossaryTermDTO}[] = [];

    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;
    const termElements = htmlDom.querySelectorAll("[id^='glossary-term-']") as NodeListOf<HTMLElement>;
    if (termElements.length === 0) return [html, () => []];

    for (let i = 0; i < termElements.length; i++) {
        const termId = termElements[i].id.slice(14); // Remove "glossary-term-" prefix
        const term = getTermFromCandidateTerms(glossaryTerms.filter(term => term.id?.replace(/\|/g, '-') === termId));

        if (term) {
            const uniqueId = `${termId}-${componentUuid}-${i}`;
            if (termElements[i].dataset.type === "full") {
                const fullTermDiv = document.createElement('div');
                fullTermDiv.setAttribute("class", "glossary_term row");
                fullTermDiv.setAttribute("id", uniqueId);
                termElements[i].parentNode?.replaceChild(fullTermDiv, termElements[i]);
                fullTermContainers.push({id: fullTermDiv.id, term: {...term}});
            } else if (termElements[i].dataset.type === "inline") {
                const text = termElements[i].dataset.text;
                termElements[i].innerHTML = text ?? term.value ?? "";
                termElements[i].setAttribute("id", uniqueId);
                tooltips.push(
                    <UncontrolledTooltip key={uniqueId} placement="bottom" target={uniqueId}>
                        <Markup trusted-markup-encoding={"markdown"}>
                            {term.explanation?.value}
                        </Markup>
                    </UncontrolledTooltip>
                );
            }
        } else {
            console.error('No valid term for "' + termId + '" found among the filtered terms: ', glossaryTerms);
            termElements[i].innerHTML = segueEnvironment === "PROD"
                ? (termElements[i].dataset.text ?? "")
                : `[Invalid glossary term ID: ${termId}]`;
        }
    }
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? [...tooltips, ...fullTermContainers.map(({id, term}) => <GlossaryTerm key={id} id={id} term={term} rootElement={ref}/>)] : tooltips
    ];
}