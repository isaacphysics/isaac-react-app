import React, { ContextType, useContext, useEffect } from "react";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { AppQuestionDTO, InlineStringEntryZoneContext } from "../../../IsaacAppTypes";
import { GameboardDTO, IsaacInlineRegionDTO } from "../../../IsaacApiTypes";
import { submitCurrentAttempt } from "./IsaacQuestion";

// TODO: generify this (IsaacContentProps?), reuse also for IsaacCardDeck
interface IsaacInlineRegionProps {
    doc: IsaacInlineRegionDTO,
    className?: string
}

export const submitInlineRegion = (inlineContext: ContextType<typeof InlineStringEntryZoneContext>, currentGameboard: GameboardDTO | undefined, currentUser: any, pageQuestions: AppQuestionDTO[] | undefined, dispatch: any) => {
    if (inlineContext && inlineContext.docId) {
        const inlineQuestionDTOs = Object.values(inlineContext.elementToQuestionMap);
        for (const inlineQuestionDTO of inlineQuestionDTOs) {
            console.log("Submitting", {type: "stringChoice", value: inlineQuestionDTO.attempt});
            submitCurrentAttempt({currentAttempt: {type: "stringChoice", value: inlineQuestionDTO.attempt}}, inlineQuestionDTO.questionId, currentGameboard, currentUser, dispatch);
            // submitCurrentAttempt({currentAttempt: {type: "stringChoice", value: inlineQuestionDTO.attempt}}, inlineQuestionDTO.questionId.split("|").at(-1) ?? "", currentGameboard, currentUser, dispatch);
            // submitCurrentAttempt({currentAttempt: {type: "stringChoice", value: inlineQuestionDTO.attempt}}, (inlineQuestionDTO.questionId.split("|").at(0) ?? "") + "|" + (inlineQuestionDTO.questionId.split("|").at(-1) ?? ""), currentGameboard, currentUser, dispatch);

            // }
        }
    }
};


const IsaacInlineRegion = ({doc, className}: IsaacInlineRegionProps) => {
    // const registeredDropRegionIDs = useRef<Map<string, number>>(new Map()).current;

    // const inlinePartValidationMap = useRef<Record<string, {correct: boolean | undefined}>>({}).current;
    const inlineContext = useContext(InlineStringEntryZoneContext);

    useEffect(() => {
        if (inlineContext) {
            doc.inlineQuestions?.forEach(inlineQuestion => {
                if (inlineQuestion.id) {
                    const elementId = inlineQuestion.id.split("|").at(-1)?.replace("inline-question:", "inline-question-") ?? "unknown";
                    inlineContext.elementToQuestionMap[elementId] = {questionId: inlineQuestion.id};
                }
            });
        }
    }, []);


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