import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { InlineQuestionType, selectQuestionPart } from "../../../../services";
import { AppQuestionDTO, InlineContext, QuestionCorrectness } from "../../../../../IsaacAppTypes";
import { selectors, useAppSelector } from "../../../../state";
import classNames from "classnames";
import { InlineStringEntryZone } from "../../inputs/InlineStringEntryZone";
import { InlineNumericEntryZone } from "../../inputs/InlineNumericEntryZone";
import { InlineMultiChoiceEntryZone } from "../../inputs/InlineMultiChoiceEntryZone";
import { IsaacMultiChoiceQuestionDTO, IsaacNumericQuestionDTO, IsaacRegexMatchQuestionDTO, IsaacStringMatchQuestionDTO, QuantityDTO } from "../../../../../IsaacApiTypes";
import { InputProps } from "reactstrap";

export function correctnessClass(correctness: QuestionCorrectness) {
    switch (correctness) {
        case "CORRECT": return "is-valid";
        case "INCORRECT": return "is-invalid";
        case "NOT_ANSWERED": return "is-unanswered";
        default: return "";
    }
}

export interface InlineEntryZoneProps<T> extends InputProps {
    // Any inline zone styles (string match, numeric...) should use this interface
    setModified: React.Dispatch<React.SetStateAction<boolean>>;
    correctness: QuestionCorrectness,
    focusRef: React.RefObject<any>,
    questionDTO: T & AppQuestionDTO;
    contentClasses: string;
    contentStyle: React.CSSProperties,
}

export interface InlineEntryZoneBaseProps {
    inlineSpanId: string, 
    className: string, 
    width?: string, // since this is used for both in-text and in-figure inline zones, which use different units (px / %), assume that it has the correct unit appended already
    minWidth?: string,
    height?: string, // height is not intended to be dynamic, so no split between minHeight and height
    root: HTMLElement
}

const InlineEntryZoneBase = ({inlineSpanId, className: contentClasses, width, minWidth, height, root}: InlineEntryZoneBaseProps) => {
    
    const inlineContext = useContext(InlineContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);

    const inlineInputId = inlineSpanId.replaceAll("_", "-") + "-input";

    const questionId = inlineContext?.elementToQuestionMap?.[inlineInputId]?.questionId;
    const questionType = inlineContext?.elementToQuestionMap?.[inlineInputId]?.type as InlineQuestionType | undefined;
    const questionDTO = selectQuestionPart(pageQuestions, questionId);

    const elementIndex = Object.keys(inlineContext?.elementToQuestionMap ?? {}).indexOf(inlineInputId);
    const [isSelectedFeedback, setIsSelectedFeedback] = useState<boolean>(false);

    const [correctness, setCorrectness] = useState<QuestionCorrectness>("NOT_SUBMITTED");
    const [modified, setModified] = useState((questionId && inlineContext?.modifiedQuestionIds.includes(questionId)) || false);

    // TODO: separate out from inline questions, this is entirely independent
    const isUnanswered = useCallback((questionType?: string, questionDTO?: AppQuestionDTO): boolean => {  
        switch (questionType) {  
            case "isaacNumericQuestion": 
                return questionDTO?.currentAttempt?.value === undefined && (questionDTO?.currentAttempt as QuantityDTO)?.units === undefined;  
            case "isaacStringMatchQuestion":
            case "isaacMultiChoiceQuestion":
            case "isaacRegexMatchQuestion":
            default:
                return questionDTO?.currentAttempt?.value === undefined;
        }  
    }, []);  

    useEffect(() => {
        // remove the question from the list of modified questions if it has been validated
        if (questionId && inlineContext && questionDTO?.validationResponse && inlineContext.modifiedQuestionIds.includes(questionId)) {
            inlineContext.setModifiedQuestionIds((m : string[]) => m.filter((e : string) => e !== questionId));
            setModified(false);
        }
    // only want to run this on validation change (i.e. questionDTO?.validationResponse update). questionId is harmless, but anything in inlineContext will cause looping
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questionDTO?.validationResponse, questionId]);

    useEffect(() => {
        if (inlineContext && questionId) {
            inlineContext.setModifiedQuestionIds((m : string[]) => modified ? [...m, ...(m.includes(questionId) ? [] : [questionId])] : m.filter((e : string) => e !== questionId));
            inlineContext.setIsModifiedSinceLastSubmission(m => m || modified);
            inlineContext.setFeedbackIndex(undefined);
        }
    }, [modified, questionId]);
    
    useEffect(() => {  
        // after submitting the region (which only touches modified entry zones), if the user has not answered this question, mark it as "NOT_ANSWERED".  
        if (inlineContext?.submitting === false && isUnanswered(questionType, questionDTO)) {  
            setCorrectness("NOT_ANSWERED");  
        }  
    // this *must* only run when inlineContext?.submitting changes. other deps change on page load, and we do not want to overwrite the correctness in these cases
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [inlineContext?.submitting]); 

    useEffect(() => {
        setCorrectness(
            // if the user has modified any question attempt without submitting, hide any validation.
            modified 
                ? "NOT_SUBMITTED" 
                // if a question has been answered since loading the page, and the question has been validated, show the correctness of this attempt.
                : questionDTO?.validationResponse?.correct 
                    ? "CORRECT" 
                    : questionDTO?.validationResponse?.correct === false 
                        ? (!questionDTO.validationResponse.answer?.value
                            // if the attempt is empty, prefer "NOT_ANSWERED" over "INCORRECT".
                            ? "NOT_ANSWERED" 
                            : "INCORRECT"
                        ) 
                        : questionDTO?.bestAttempt?.correct 
                            // if no question attempt has been submitted, it will either be displaying the previous best attempt if correct or incorrect,
                            // or a *blank* attempt if the best attempt was empty (!) or does not exist.
                            ? "CORRECT" 
                            : questionDTO?.bestAttempt?.correct === false 
                                ? (!questionDTO.bestAttempt?.answer?.value 
                                    ? "NOT_SUBMITTED" 
                                    : "INCORRECT") 
                                : "NOT_SUBMITTED"
        );
    }, [modified, questionDTO?.bestAttempt, questionDTO?.validationResponse]);

    useEffect(() => {
        setIsSelectedFeedback(inlineContext?.feedbackIndex === elementIndex);
    }, [elementIndex, inlineContext?.feedbackIndex]);

    const focusRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (focusRef && focusRef.current && inlineContext?.focusSelection && inlineContext?.feedbackIndex === elementIndex) {
            // FIXME the ref is set but this doesn't seem to work
            focusRef.current.focus();
            inlineContext.setFocusSelection(false);
        }
    }, [inlineContext?.focusSelection]);

    if (!questionId || !questionDTO ) {
        // On following a soft link, the way that we register questions and build elementToQuestionMap means that on first render this questionId and questionDTO will be undefined.
        return null;
    }

    const inlineEntryZone = root?.querySelector(`#${inlineSpanId}`);

    if (!inlineEntryZone) {
        console.error(`Inline entry zone (id: ${inlineSpanId}) not found.`);
        return null;
    }

    function getComponent() : Exclude<React.ReactNode, undefined> {
        if (!questionType) return null;
        
        switch (questionType) {
            case "isaacNumericQuestion": {
                return <InlineNumericEntryZone 
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacNumericQuestionDTO & AppQuestionDTO} 
                    className={classNames(correctnessClass(correctness), {"selected-feedback": isSelectedFeedback})}
                    contentClasses={contentClasses}
                    contentStyle={{width, minWidth, height}}
                    setModified={setModified}
                    onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
                    focusRef={focusRef}
                />;
            }
            case "isaacStringMatchQuestion": {
                return <InlineStringEntryZone 
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacStringMatchQuestionDTO & AppQuestionDTO} 
                    className={classNames(correctnessClass(correctness), {"selected-feedback": isSelectedFeedback})}
                    contentClasses={contentClasses}
                    contentStyle={{width, minWidth, height}}
                    setModified={setModified}
                    onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
                    focusRef={focusRef}
                />;
            }
            case "isaacMultiChoiceQuestion": {
                return <InlineMultiChoiceEntryZone
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacMultiChoiceQuestionDTO & AppQuestionDTO} 
                    className={classNames(correctnessClass(correctness), {"selected-feedback": isSelectedFeedback})}
                    contentClasses={contentClasses}
                    contentStyle={{width, minWidth, height}}
                    setModified={setModified}
                    onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
                    focusRef={focusRef}
                />;
            }
            case "isaacRegexMatchQuestion": {
                return <InlineStringEntryZone 
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacRegexMatchQuestionDTO & AppQuestionDTO} 
                    className={classNames(correctnessClass(correctness), {"selected-feedback": isSelectedFeedback})}
                    contentClasses={contentClasses}
                    contentStyle={{width, minWidth, height}}
                    setModified={setModified}
                    onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
                    focusRef={focusRef}
                />;
            }
        }
    }

    return <>
        {ReactDOM.createPortal(
            getComponent(),
            inlineEntryZone
        )}
    </>;
};
export default InlineEntryZoneBase;
