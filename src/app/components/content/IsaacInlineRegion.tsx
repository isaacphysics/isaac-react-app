import React, { ContextType, useContext, useEffect } from "react";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { AppQuestionDTO, InlineStringEntryZoneContext } from "../../../IsaacAppTypes";
import { ContentDTO, GameboardDTO, IsaacInlineRegionDTO } from "../../../IsaacApiTypes";
import { submitCurrentAttempt } from "./IsaacQuestion";
import { deregisterQuestions, registerQuestions, selectors, useAppDispatch, useAppSelector } from "../../state";
import { selectQuestionPart } from "../../services";

// TODO: generify this (IsaacContentProps?), reuse also for IsaacCardDeck
interface IsaacInlineRegionProps {
    doc: IsaacInlineRegionDTO,
    className?: string
}

const defaultFeedback : ContentDTO = {
    type: "content",
    encoding: "plaintext",
    value: "(No feedback available for this part)",
};

// return a "question part" representing the inline region; the validation response is a combination of the validation responses of each of the inline questions
export const useInlineRegionPart = (pageQuestions: AppQuestionDTO[] | undefined) : AppQuestionDTO => {
    const inlineContext = useContext(InlineStringEntryZoneContext);
    const currentFeedbackPart = inlineContext?.feedbackIndex;
    const inlineQuestions = pageQuestions?.filter(q => inlineContext?.docId && q.id?.startsWith(inlineContext?.docId) && q.id.includes("|inline-question:"));
    const validationResponses = inlineQuestions?.map(q => q.validationResponse);
    const bestAttempts = inlineQuestions?.map(q => q.bestAttempt);
    const correct = (inlineContext?.modified ? validationResponses : bestAttempts)?.every(r => r?.correct) || false;
    const explanation = {
        ...validationResponses?.[0]?.explanation, 
        value: undefined, 
        // if the response explanation exists (i.e. it has a value or children), use it; otherwise use the default feedback
        children: currentFeedbackPart !== undefined ? [
            validationResponses?.[currentFeedbackPart]?.explanation?.value || validationResponses?.[currentFeedbackPart]?.explanation?.children?.length
            ? validationResponses?.[currentFeedbackPart]?.explanation ?? defaultFeedback
            : defaultFeedback
        ] : undefined,
    };
    const lockedDates = inlineQuestions?.map(q => q.locked).filter(d => d) as Date[] | undefined;
    return {
        currentAttempt: undefined,
        bestAttempt: undefined,
        validationResponse: !inlineContext?.submitting ? {
            // correct is always constant for a given set of answers, and is only true if all answers are correct
            correct: correct,
            // explanation is NOT constant, it changes with the feedback index
            explanation: explanation,
        } : undefined,
        locked: lockedDates?.length ? new Date(lockedDates.reduce((a, b) => Math.max(a, b.valueOf()), 0)) : undefined,
        canSubmit: inlineContext?.canSubmit,
    };
};

export const submitInlineRegion = (inlineContext: ContextType<typeof InlineStringEntryZoneContext>, currentGameboard: GameboardDTO | undefined, currentUser: any, pageQuestions: AppQuestionDTO[] | undefined, dispatch: any) => {
    if (inlineContext && inlineContext.docId && pageQuestions) {
        inlineContext.setSubmitting(true);
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