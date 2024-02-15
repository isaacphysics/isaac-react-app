import React, { ContextType, useContext, useEffect } from "react";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { AppQuestionDTO, InlineStringEntryZoneContext } from "../../../IsaacAppTypes";
import { GameboardDTO, IsaacInlineRegionDTO } from "../../../IsaacApiTypes";
import { submitCurrentAttempt } from "./IsaacQuestion";
import { deregisterQuestions, registerQuestions, selectors, useAppDispatch, useAppSelector } from "../../state";
import { selectQuestionPart } from "../../services";

// TODO: generify this (IsaacContentProps?), reuse also for IsaacCardDeck
interface IsaacInlineRegionProps {
    doc: IsaacInlineRegionDTO,
    className?: string
}

export const submitInlineRegion = (inlineContext: ContextType<typeof InlineStringEntryZoneContext>, currentGameboard: GameboardDTO | undefined, currentUser: any, pageQuestions: AppQuestionDTO[] | undefined, dispatch: any) => {
    if (inlineContext && inlineContext.docId && pageQuestions) {
        for (const inlineQuestion of pageQuestions) {
            // it must start with the doc id and be an inline question; there may be content ids between these two parts so we can't just check for startsWith the concatenation of both
            if (inlineQuestion.id?.startsWith(inlineContext.docId) && inlineQuestion.id?.includes("|inline-question:")) {
                // if (inlineQuestion.currentAttempt?.value) {
                    // TODO: If we don't mark empty attempts, they won't come back incorrect
                submitCurrentAttempt({currentAttempt: {type: "stringChoice", value: inlineQuestion.currentAttempt?.value}}, inlineQuestion.id, currentGameboard, currentUser, dispatch);
                // }
            }
        }
        inlineContext.canSubmit = false;
    }
};


const IsaacInlineRegion = ({doc, className}: IsaacInlineRegionProps) => {

    const dispatch = useAppDispatch();
    const inlineContext = useContext(InlineStringEntryZoneContext);

    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const inlineRegionDTO = selectQuestionPart(pageQuestions, doc.id) as IsaacInlineRegionDTO;

    useEffect(() => {
        if (inlineContext) {
            inlineRegionDTO.inlineQuestions?.forEach(inlineQuestion => {
                if (inlineQuestion.id) {
                    const elementId = inlineQuestion.id.split("|").at(-1)?.replace("inline-question:", "inline-question-") ?? "unknown";
                    inlineContext.elementToQuestionMap[elementId] = {questionId: inlineQuestion.id};
                }
            });
        }
    }, []);

    // Register the inline question parts in Redux, so we can access previous/current attempts
    useEffect(() => {
        inlineRegionDTO.inlineQuestions && dispatch(registerQuestions(inlineRegionDTO.inlineQuestions, inlineContext?.docId));
        return () => dispatch(deregisterQuestions([inlineContext?.docId as string]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, inlineContext?.docId]);

    // TODO: div id
    return <div className="question-content inline-region">
        {/* <InlineStringEntryZoneContext.Provider value={{docId: doc.id, inlinePartValidationMap: inlinePartValidationMap}}> */}
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        {/* </InlineStringEntryZoneContext.Provider> */}
    </div>;
};
export default IsaacInlineRegion;