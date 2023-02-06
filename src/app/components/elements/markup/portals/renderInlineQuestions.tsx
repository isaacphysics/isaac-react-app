import {PortalInHtmlHook} from "./utils";
import React, {useContext} from "react";
import {MultiPartQuestionContext} from "../../../../../IsaacAppTypes";
import {InlineQuestion} from "./InlineQuestion";

// See the comment on `PORTAL_HOOKS` constant for an explanation of how this works
export const useInlineQuestionsInHtml: PortalInHtmlHook = (html) => {
    // If not in a multi-part question, don't bother trying to find and render inline-question divs
    const multiPartQuestionContext = useContext(MultiPartQuestionContext);
    if (!multiPartQuestionContext) return [html, () => []];

    const inlineQInfo: { id: string; questionId: string; marks: number; }[] = [];
    const htmlDom = document.createElement("html");
    htmlDom.innerHTML = html;

    const inlineQElements = htmlDom.querySelectorAll(`div.inline-question`) as NodeListOf<HTMLElement>;
    if (inlineQElements.length === 0) return [html, () => []];

    for (let i = 0; i < inlineQElements.length; i++) {
        const questionId = inlineQElements[i].dataset.id;
        const marks = parseInt(inlineQElements[i].dataset.marks ?? "1") || 1;
        if (!questionId) {
            console.error("Inline question element has invalid id data attribute!", inlineQElements[i]);
            continue;
        }
        const id = `${multiPartQuestionContext.questionPartId}-${questionId}`;
        console.log(id);
        inlineQElements[i].setAttribute("id", id);
        inlineQInfo.push({id, questionId, marks});
    }

    return [
        htmlDom.innerHTML,
        (ref?: HTMLElement) => ref ? inlineQInfo.map(({id, questionId, marks}) =>
            <InlineQuestion key={id} id={id} questionId={questionId} marks={marks} rootElement={ref} />
        ) : []
    ];
};