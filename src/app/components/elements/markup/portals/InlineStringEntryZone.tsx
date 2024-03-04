import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Input } from "reactstrap";
import { selectQuestionPart, useCurrentQuestionAttempt } from "../../../../services";
import { StringChoiceDTO } from "../../../../../IsaacApiTypes";
import { InlineStringEntryZoneContext } from "../../../../../IsaacAppTypes";
import { selectors, useAppSelector } from "../../../../state";
import classNames from "classnames";

const InlineStringEntryZone = ({inlineSpanId, width, height, root}: {inlineSpanId: string, width: number, height: number, root: HTMLElement}) => {
    
    const inlineContext = useContext(InlineStringEntryZoneContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);

    const inlineInputId = inlineSpanId.replaceAll("_", "-") + "-input";

    const questionId = inlineContext?.elementToQuestionMap?.[inlineInputId].questionId;
    const questionDTO = selectQuestionPart(pageQuestions, questionId);
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId as string);

    const bestAttempt = questionDTO?.bestAttempt?.answer?.value ?? "";
    const [previousAttempt, setPreviousAttempt] = useState<string | undefined>(bestAttempt);

    const [elementIndex, _setElementIndex] = useState<number>(Object.keys(inlineContext?.elementToQuestionMap ?? {}).indexOf(inlineInputId));
    const [isSelectedFeedback, setIsSelectedFeedback] = useState<boolean>(false);

    const [modified, setModified] = useState(false);

    useEffect(() => {
        // only show the "Correct!" / "Incorrect" message once the last part submission has returned 
        if (inlineContext && questionDTO?.validationResponse) {
            setModified(false);
            setPreviousAttempt(currentAttempt?.value);
            const elements = Object.keys(inlineContext.elementToQuestionMap);
            if (elements.indexOf(inlineInputId) === elements.length - 1) {
                inlineContext.setSubmitting(false);
                inlineContext.setModifiedQuestionIds([]);
                inlineContext.setIsModifiedSinceLastSubmission(false);
            }
        }
    }, [questionDTO?.validationResponse]);

    useEffect(() => {
        setIsSelectedFeedback(inlineContext?.feedbackIndex === elementIndex);
    }, [elementIndex, inlineContext?.feedbackIndex]);

    const inlineStringEntryZone = root?.querySelector(`#${inlineSpanId}`);

    if (!inlineStringEntryZone) {
        console.error("Inline string entry zone not found for id", inlineSpanId);
        return null;
    }

    return <>
        {ReactDOM.createPortal(
            <Input 
                valid={questionDTO?.validationResponse?.correct || (!modified && questionDTO?.bestAttempt?.correct)} 
                invalid={questionDTO?.validationResponse?.correct === false || (!modified && questionDTO?.bestAttempt?.correct === false)} 
                id={inlineInputId} 
                style={{width: `${width}px`, height: `${height}px`}}
                className={classNames("inline-part", {"selected-feedback": isSelectedFeedback})}
                value={currentAttempt?.value ?? ""}
                onChange={(e) => {
                    if (inlineContext && questionId) {
                        const modified = e.target.value !== previousAttempt;
                        setModified(modified);
                        inlineContext.setModifiedQuestionIds((m : string[]) => modified ? [...m, ...(m.includes(questionId) ? [] : [questionId])] : m.filter((e : string) => e !== questionId));
                        inlineContext.setIsModifiedSinceLastSubmission(m => m || modified);
                        dispatchSetCurrentAttempt({type: "stringChoice", value: e.target.value});
                    }
                }} 
                onFocus={() => inlineContext?.feedbackIndex !== undefined && inlineContext?.setFeedbackIndex(elementIndex)}
            />,
            inlineStringEntryZone
        )}
    </>;
};
export default InlineStringEntryZone;