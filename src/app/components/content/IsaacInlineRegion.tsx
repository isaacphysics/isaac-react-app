import React, { ContextType, useContext, useEffect, useMemo } from "react";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { AppQuestionDTO, InlineQuestionDTO, InlineContext, QuestionCorrectness } from "../../../IsaacAppTypes";
import { ContentDTO, GameboardDTO, IsaacInlineRegionDTO } from "../../../IsaacApiTypes";
import { selectors, useAppSelector } from "../../state";
import { submitCurrentAttempt } from "../../services";

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
    
    const hidingAttempts = useAppSelector(selectors.user.preferences)?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS ?? false;
    const currentAttempts = validationResponses?.map((vr, i) => vr || (hidingAttempts ? undefined : bestAttempts?.[i])); // use bestAttempts if no validation response (i.e. if loaded attempt has not changed since page load)
    
    const partsCorrect = currentAttempts?.filter(r => r?.correct).length;
    const partsTotal = currentAttempts?.length;
    const correct = partsCorrect !== undefined && (partsCorrect === partsTotal);
    const canSubmit = (inlineContext?.modifiedQuestionIds?.length ?? 0) > 0 && !inlineContext?.submitting;

    const defaultFeedback = (correctness: QuestionCorrectness) : ContentDTO => {
        const feedbackMap : {[key in QuestionCorrectness]: string} = {
            "CORRECT" : "Correct!",
            "INCORRECT" : "Check your working.",
            "NOT_ANSWERED" : "You did not provide an answer.",
            "NOT_SUBMITTED" : "This answer is missing a unit.", // this is a special case for numeric questions, may need to be updated if we add more inline q types
        };

        return {
            type: "content",
            encoding: "plaintext",
            value: partsTotal && partsTotal > 1 ? feedbackMap[correctness] : "",
        };
    };

    useEffect(() => {
        const isFeedbackShown = currentAttempts?.some(vr => vr !== undefined) && !inlineContext?.submitting && !inlineContext?.isModifiedSinceLastSubmission && !canSubmit;
        if (isFeedbackShown && inlineContext && inlineContext.feedbackIndex === undefined && inlineQuestions && inlineQuestions.length > 0) {
            inlineContext.setFeedbackIndex(0);
        }
    }, [canSubmit, currentAttempts, inlineContext]);
    
    const explanation = {
        ...currentAttempts?.[currentFeedbackPart ?? 0]?.explanation, 
        value: undefined, 
        // if the response explanation exists (i.e. it has a value or children), use it; otherwise use the default feedback
        children: currentFeedbackPart !== undefined ? [
            (currentAttempts?.[currentFeedbackPart]?.explanation?.value || currentAttempts?.[currentFeedbackPart]?.explanation?.children?.length) && 
            currentAttempts?.[currentFeedbackPart]?.explanation !== undefined ? currentAttempts?.[currentFeedbackPart]?.explanation as ContentDTO : defaultFeedback(
                currentAttempts?.[currentFeedbackPart]?.correct ? "CORRECT" : 
                currentAttempts?.[currentFeedbackPart]?.answer?.value !== undefined ? "INCORRECT" : "NOT_ANSWERED"
            )
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

export const submitInlineRegion = (inlineContext: ContextType<typeof InlineContext>, currentGameboard: GameboardDTO | undefined, currentUser: any, pageQuestions: AppQuestionDTO[] | undefined, dispatch: any, hidingAttempts : boolean) => {
    if (inlineContext && inlineContext.docId && pageQuestions) {
        inlineContext.setSubmitting(true);
        const inlineQuestions = pageQuestions.filter(q => inlineContext.docId && q.id?.startsWith(inlineContext.docId) && q.id.includes("|inline-question:"));
        // we submit all modified answers, and those with undefined values. we must submit this latter group to get a validation response at the same time as the other answers
        const modifiedInlineQuestions = inlineQuestions.filter(q => (q.id && inlineContext.modifiedQuestionIds.includes(q.id)) || (q.currentAttempt?.value === undefined && (q.bestAttempt === undefined || hidingAttempts)));
        for (const inlineQuestion of modifiedInlineQuestions) {
            submitCurrentAttempt(
                {currentAttempt: inlineQuestion.currentAttempt},
                inlineQuestion.id as string, inlineQuestion.type as string, currentGameboard, currentUser, dispatch, inlineContext
            );
        }
        inlineContext.canShowWarningToast = true;
        if (Object.keys(inlineContext.elementToQuestionMap).length > 1) inlineContext.setFeedbackIndex(0);
    }
};

function getInlineQuestions(questions?: AppQuestionDTO[], inlineRegionId?: string) {
    if (!questions || !inlineRegionId) return;
    return questions.filter(question => question.id?.startsWith(inlineRegionId + "|inline-question:"));
}

const IsaacInlineRegion = ({doc, className}: IsaacInlineRegionProps) => {

    const inlineContext = useContext(InlineContext);

    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const inlineQuestions = useMemo(() => getInlineQuestions(pageQuestions, doc.id), [doc.id, pageQuestions]);

    useEffect(() => {
        if (inlineContext) {
            inlineQuestions?.forEach(inlineQuestion => {
                if (inlineQuestion.id && inlineQuestion.type) {
                    const questionId = inlineQuestion.id.split("|").at(-1);
                    const elementId = questionId ? (questionId.replace("inline-question:", "inline-question-") + "-input") : "unknown";
                    inlineContext.elementToQuestionMap[elementId] = {questionId: inlineQuestion.id, type: inlineQuestion.type};
                }
            });
            inlineContext.setInitialised(true);
        }
    }, [inlineQuestions]);

    useEffect(() => {
        // once the final question part to a region has been submitted, show the feedback box
        if (inlineContext?.submitting && inlineContext.modifiedQuestionIds?.length === 0) {
            inlineContext.setSubmitting(false);
            inlineContext.setIsModifiedSinceLastSubmission(false);
            inlineContext.setFeedbackIndex(0);
            inlineContext.canShowWarningToast = true;
        }
    }, [inlineContext?.modifiedQuestionIds]);

    return <div className={`question-content inline-region ${className ?? ""}`}>
        <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
            {doc.children}
        </IsaacContentValueOrChildren>
    </div>;
};
export default IsaacInlineRegion;
