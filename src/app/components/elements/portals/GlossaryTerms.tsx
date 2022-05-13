import {GlossaryTermDTO} from "../../../../IsaacApiTypes";
import React, {useState} from "react";
import ReactDOM from "react-dom";
import {IsaacGlossaryTerm} from "../../content/IsaacGlossaryTerm";
import {useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {v4 as uuid_v4} from "uuid";
import {UncontrolledTooltip} from "reactstrap";
import {TrustedMarkdown} from "../TrustedMarkdown";

const GlossaryTerm = ({term, id, rootElement}: {term: GlossaryTermDTO, id: string, rootElement: HTMLElement}) => {
    const parentElement = rootElement.querySelector(`#${id}`);
    if (parentElement) {
        return ReactDOM.createPortal(
            <IsaacGlossaryTerm doc={term}/>,
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
export const useGlossaryTermsInHtml = (html: string) => {
    const glossaryTerms = useSelector((state: AppState) => state && state.glossaryTerms);
    const [componentUuid] = useState(uuid_v4().slice(0, 8));

    if (!glossaryTerms) {
        return {htmlWithGlossaryTerms: html, tooltips: [], renderGlossaryTerms: () => []}
    }

    const tooltips: JSX.Element[] = [];
    const fullTermContainers: {id: string; term: GlossaryTermDTO}[] = [];

    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;
    const spans = htmlDom.querySelectorAll("span[id^='glossary-term-']") as NodeListOf<HTMLElement>;
    for (let i = 0; i < spans.length; i++) {
        const termId = spans[i].id.slice(14);
        const term = getTermFromCandidateTerms(glossaryTerms.filter(term => term.id?.replace(/\|/g, '-') === termId));

        if (term) {
            const uniqueId = `${termId}-${componentUuid}-${i}`;
            if (spans[i].dataset.type === "full") {
                const fullTermDiv = document.createElement('div');
                fullTermDiv.setAttribute("id", uniqueId);
                spans[i].parentNode?.replaceChild(fullTermDiv, spans[i]);
                fullTermContainers.push({id: fullTermDiv.id, term: {...term}});
            } else if (spans[i].dataset.type === "inline") { // Assume inline
                const text = spans[i].dataset.text;
                spans[i].innerHTML = text ?? term.value ?? "";
                spans[i].setAttribute("id", uniqueId);
                tooltips.push(
                    <UncontrolledTooltip key={uniqueId} placement="bottom" target={uniqueId}>
                        <TrustedMarkdown markdown={term.explanation?.value || ''} />
                    </UncontrolledTooltip>
                );
            }
        } else {
            console.error('No valid term for "' + termId + '" found among the filtered terms: ', glossaryTerms);
        }
    }
    return {
        htmlWithGlossaryTerms: htmlDom.innerHTML,
        tooltips: tooltips,
        renderGlossaryTerms: (ref?: HTMLElement) => ref ? fullTermContainers.map(({id, term}) => <GlossaryTerm key={id} id={id} term={term} rootElement={ref}/>) : []
    };
}