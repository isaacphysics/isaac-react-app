import {GlossaryTermDTO} from "../../../../../IsaacApiTypes";
import React, {useContext, useState} from "react";
import ReactDOM from "react-dom";
import {IsaacGlossaryTerm} from "../../../content/IsaacGlossaryTerm";
import {useSelector} from "react-redux";
import {AppState} from "../../../../state/reducers";
import {v4 as uuid_v4} from "uuid";
import {UncontrolledTooltip} from "reactstrap";
import {PortalInHtmlHook} from "./utils";
import {Markup} from "../index";
import {selectors} from "../../../../state/selectors";
import {RegisterContentErrorContext} from "../../../pages/ContentErrorBoundary";

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

// The component that uses this hook should be using the pattern demonstrated in `TrustedHtml`.
// This pattern is the following:
// - The html produced by this hook is rendered within an element using the `dangerouslySetInnerHTML` attribute. Call this the root element.
// - When calling `renderGlossaryTerms`, *pass the root element*
// - Ensure that the root element is set and updated using the `useStatefulElementRef` hook. This means that when the element
// is added to the DOM, a update occurs for all components that take this element as a prop.
//
// Using this pattern, you can safely nest portal components to an arbitrary depth (as far as I can tell)
export const useGlossaryTermsInHtml: PortalInHtmlHook = (html) => {
    const glossaryTerms = useSelector((state: AppState) => state && state.glossaryTerms);
    const segueEnvironment = useSelector(selectors.segue.environmentOrUnknown);
    const registerContentError = useContext(RegisterContentErrorContext);
    const [componentUuid] = useState(uuid_v4().slice(0, 8));

    if (!glossaryTerms) return [html, () => []];

    const tooltips: JSX.Element[] = [];
    const fullTermContainers: {id: string; term: GlossaryTermDTO}[] = [];

    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;
    const termElements = htmlDom.querySelectorAll("[id^='glossary-term-']") as NodeListOf<HTMLElement>;
    if (termElements.length === 0) return [html, () => []];

    for (let i = 0; i < termElements.length; i++) {
        const termId = termElements[i].id.slice(14);
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
            registerContentError('No valid term for "' + termId + `" found among the filtered terms`);
            termElements[i].innerHTML = segueEnvironment === "PROD" ? "" : `[Invalid glossary term ID: ${termId}]`;
        }
    }
    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? [...tooltips, ...fullTermContainers.map(({id, term}) => <GlossaryTerm key={id} id={id} term={term} rootElement={ref}/>)] : tooltips
    ];
}