import React, { ContextType, useContext, useEffect } from "react";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { AppQuestionDTO, InlineQuestionDTO, InlineContext } from "../../../IsaacAppTypes";
import { ContentDTO, GameboardDTO, IsaacInlineRegionDTO } from "../../../IsaacApiTypes";
import { deregisterQuestions, registerQuestions, selectors, useAppDispatch, useAppSelector } from "../../state";
import { selectQuestionPart, submitCurrentAttempt } from "../../services";

// TODO: generify this (IsaacContentProps?), reuse also for IsaacCardDeck
interface IsaacInlineRegionProps {
    doc: IsaacInlineRegionDTO,
    className?: string
}

// return a "question part" representing the inline region; the validation response is a combination of the validation responses of each of the inline questions
export const useInlineRegionPart = (pageQuestions: AppQuestionDTO[] | undefined) : InlineQuestionDTO => {
    const inlineContext = useContext(InlineContext);
    const currentFeedbackPart = inlineContext?.feedbackIndex;
    const inlineQuestions = pageQuestions?.filter(q => inlineContext?.docId && q.id?.startsWith(inlineContext?.docId) && q.id.includes("|inline-question:"));
    const validationResponses = inlineQuestions?.map(q => q.validationResponse);
    const bestAttempts = inlineQuestions?.map(q => q.bestAttempt);
    const currentAttempts = validationResponses?.some(e => e) ? validationResponses : bestAttempts; // use bestAttempts on page load
    
    const partsCorrect = currentAttempts?.filter(r => r?.correct).length;
    const partsTotal = currentAttempts?.length;
    const correct = partsCorrect !== undefined && (partsCorrect === partsTotal);
    const canSubmit = (inlineContext?.modifiedQuestionIds?.length ?? 0) > 0 && !inlineContext?.submitting;

    const defaultFeedback : ContentDTO = {
        type: "content",
        encoding: "plaintext",
        value: partsTotal && partsTotal > 1 ? "(No feedback available for this part)" : "",
    };

    useEffect(() => {
        const isFeedbackShown = currentAttempts?.some(vr => vr !== undefined) && !inlineContext?.submitting && !inlineContext?.isModifiedSinceLastSubmission && !canSubmit;
        if (isFeedbackShown && inlineContext && inlineContext.feedbackIndex === undefined && inlineQuestions && inlineQuestions.length > 1) {
            inlineContext.setFeedbackIndex(0);
        }
    }, [canSubmit, currentAttempts, inlineContext]);
    
    const explanation = {
        ...currentAttempts?.[0]?.explanation, 
        value: undefined, 
        // if the response explanation exists (i.e. it has a value or children), use it; otherwise use the default feedback
        children: currentFeedbackPart !== undefined ? [
            currentAttempts?.[currentFeedbackPart]?.explanation?.value || currentAttempts?.[currentFeedbackPart]?.explanation?.children?.length
            ? currentAttempts?.[currentFeedbackPart]?.explanation ?? defaultFeedback
            : defaultFeedback
        ] : undefined,
    };
    const lockedDates = inlineQuestions?.map(q => q.locked).filter(d => d) as Date[] | undefined;
    return {
        currentAttempt: undefined,
        bestAttempt: undefined,
        // undefined unless there exists an attempt to at least one part, and we're not currently mid-submission
        validationResponse: currentAttempts?.some(vr => vr !== undefined) && !inlineContext?.submitting ? {
            // correct is always constant for a given set of answers, and is only true if all answers are correct
            correct: correct,
            // explanation is NOT constant, it changes with the feedback index
            explanation: explanation,
            partsCorrect: partsCorrect,
            partsTotal: partsTotal,
        } : undefined,
        locked: lockedDates?.length ? new Date(lockedDates.reduce((a, b) => Math.max(a, b.valueOf()), 0)) : undefined,
        canSubmit: canSubmit,
    };
};

export const submitInlineRegion = (inlineContext: ContextType<typeof InlineContext>, currentGameboard: GameboardDTO | undefined, currentUser: any, pageQuestions: AppQuestionDTO[] | undefined, dispatch: any) => {
    if (inlineContext && inlineContext.docId && pageQuestions) {
        inlineContext.setSubmitting(true);
        for (const inlineQuestion of pageQuestions) {
            if (inlineQuestion.id?.startsWith(inlineContext.docId) && inlineQuestion.id?.includes("|inline-question:")) {
                // only submit modified questions, and questions that have not been submitted before (to get the initial incorrect response)
                // if (inlineContext.modifiedQuestionIds.includes(inlineQuestion.id) || inlineQuestion.bestAttempt === undefined) {
                    submitCurrentAttempt(
                        {currentAttempt: inlineQuestion.currentAttempt},
                        inlineQuestion.id, currentGameboard, currentUser, dispatch, inlineContext
                    );
                // }
            }
        }
        inlineContext.canShowWarningToast = true;
        Object.keys(inlineContext.elementToQuestionMap).length > 1 && inlineContext.setFeedbackIndex(0);
    }
};


const IsaacInlineRegion = ({doc, className}: IsaacInlineRegionProps) => {

    const dispatch = useAppDispatch();
    const inlineContext = useContext(InlineContext);

    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const inlineRegionDTO = selectQuestionPart(pageQuestions, doc.id) as IsaacInlineRegionDTO;

    useEffect(() => {
        if (inlineContext) {
            inlineRegionDTO.inlineQuestions?.forEach(inlineQuestion => {
                if (inlineQuestion.id && inlineQuestion.type) {
                    const elementId = (inlineQuestion.id.split("|").at(-1)?.replace("inline-question:", "inline-question-") + "-input") ?? "unknown";
                    inlineContext.elementToQuestionMap[elementId] = {questionId: inlineQuestion.id, type: inlineQuestion.type};
                }
            });
        }
    }, [inlineContext]);

    // Register the inline question parts in Redux, so we can access previous/current attempts
    useEffect(() => {
        inlineRegionDTO.inlineQuestions && dispatch(registerQuestions(inlineRegionDTO.inlineQuestions, inlineContext?.docId));
        return () => dispatch(deregisterQuestions([inlineContext?.docId as string]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, inlineContext?.docId]);

    return <div className={`question-content inline-region ${className}`}>
        <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
            {doc.children}
        </IsaacContentValueOrChildren>
    </div>;
};
export default IsaacInlineRegion;