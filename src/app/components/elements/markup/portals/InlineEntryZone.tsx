import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { selectQuestionPart } from "../../../../services";
import { AppQuestionDTO, InlineContext, QuestionCorrectness } from "../../../../../IsaacAppTypes";
import { selectors, useAppSelector } from "../../../../state";
import classNames from "classnames";
import { InlineStringEntryZone } from "../../inputs/InlineStringEntryZone";
import { InlineNumericEntryZone } from "../../inputs/InlineNumericEntryZone";
import { IsaacNumericQuestionDTO, IsaacStringMatchQuestionDTO } from "../../../../../IsaacApiTypes";
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
    width: number | undefined, 
    height: number | undefined, 
    setModified: React.Dispatch<React.SetStateAction<boolean>>;
    correctness: QuestionCorrectness,
    focusRef: React.RefObject<any>,
    questionDTO: T & AppQuestionDTO;
}

export interface InlineEntryZoneBaseProps {
    inlineSpanId: string, 
    className: string, 
    width: number | undefined, 
    height: number | undefined, 
    root: HTMLElement
}

const InlineEntryZoneBase = ({inlineSpanId, className, width, height, root}: InlineEntryZoneBaseProps) => {
    
    const inlineContext = useContext(InlineContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);

    const inlineInputId = inlineSpanId.replaceAll("_", "-") + "-input";

    const questionId = inlineContext?.elementToQuestionMap?.[inlineInputId]?.questionId;
    const questionType = inlineContext?.elementToQuestionMap?.[inlineInputId]?.type ?? "isaacStringMatchQuestion";
    const questionDTO = selectQuestionPart(pageQuestions, questionId);

    const elementIndex = Object.keys(inlineContext?.elementToQuestionMap ?? {}).indexOf(inlineInputId);
    const [isSelectedFeedback, setIsSelectedFeedback] = useState<boolean>(false);

    const [correctness, setCorrectness] = useState<QuestionCorrectness>("NOT_SUBMITTED");
    const [modified, setModified] = useState(false);

    useEffect(() => {
        setModified(questionId && inlineContext?.modifiedQuestionIds.includes(questionId) || false);
    }, [inlineContext?.modifiedQuestionIds, questionId]);

    useEffect(() => {
        // remove the question from the list of modified questions if it has been validated
        if (inlineContext && questionDTO?.validationResponse) {
            inlineContext.setModifiedQuestionIds((m : string[]) => m.filter((e : string) => e !== questionId));
        }
    }, [questionDTO?.validationResponse, questionId]);

    useEffect(() => {
        if (inlineContext && questionId) {
            inlineContext.setModifiedQuestionIds((m : string[]) => modified ? [...m, ...(m.includes(questionId) ? [] : [questionId])] : m.filter((e : string) => e !== questionId));
            inlineContext.setIsModifiedSinceLastSubmission(m => m || modified);
            inlineContext.setFeedbackIndex(undefined);
        }
    }, [modified]);

    useEffect(() => {
        setCorrectness(
            // if the user has modified any question attempt without submitting, hide any validation.
            modified ? "NOT_SUBMITTED" : 
            // if a question has been answered since loading the page, and the question has been validated, show the correctness of this attempt.
            // if the attempt is empty, prefer "NOT_ANSWERED" over "INCORRECT".
            questionDTO?.validationResponse?.correct ? "CORRECT" : 
            questionDTO?.validationResponse?.correct === false ? (!questionDTO.validationResponse.answer?.value ? "NOT_ANSWERED" : "INCORRECT") : 
            // if no question attempt has been submitted, it will either be displaying the previous best attempt if correct or incorrect,
            // or a *blank* attempt if the best attempt was empty (!) or does not exist.
            questionDTO?.bestAttempt?.correct ? "CORRECT" : 
            questionDTO?.bestAttempt?.correct === false ? (!questionDTO.bestAttempt?.answer?.value ? "NOT_SUBMITTED" : "INCORRECT") : 
            "NOT_SUBMITTED"
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

    function getComponent() {
        switch (questionType) {
            case "isaacNumericQuestion": {
                return <InlineNumericEntryZone 
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacNumericQuestionDTO & AppQuestionDTO} 
                    className={classNames("inline-part", {"selected-feedback": isSelectedFeedback})}
                    width={width}
                    height={height}
                    setModified={setModified}
                    onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
                    focusRef={focusRef}
                />;
            }
            case "isaacStringMatchQuestion": {
                return <InlineStringEntryZone 
                    correctness={correctness}
                    questionDTO={questionDTO as IsaacStringMatchQuestionDTO & AppQuestionDTO} 
                    className={classNames("inline-part", {"selected-feedback": isSelectedFeedback})}
                    width={width}
                    height={height}
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