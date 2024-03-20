import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { selectQuestionPart } from "../../../../services";
import { AppQuestionDTO, InlineContext } from "../../../../../IsaacAppTypes";
import { selectors, useAppSelector } from "../../../../state";
import classNames from "classnames";
import { InlineStringEntryZone } from "../../inputs/InlineStringEntryZone";
import { InlineNumericEntryZone } from "../../inputs/InlineNumericEntryZone";
import { IsaacNumericQuestionDTO, IsaacStringMatchQuestionDTO } from "../../../../../IsaacApiTypes";
import { InputProps } from "reactstrap";

export interface InlineEntryZoneProps<T> extends InputProps {
    width: number, 
    height: number, 
    setModified: React.Dispatch<React.SetStateAction<boolean>>;
    valid: boolean | undefined,
    invalid: boolean | undefined,
    focusRef: React.RefObject<any>,
    questionDTO: T & AppQuestionDTO;
}

const InlineEntryZone = ({inlineSpanId, width, height, root}: {inlineSpanId: string, width: number, height: number, root: HTMLElement}) => {
    
    const inlineContext = useContext(InlineContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);

    const inlineInputId = inlineSpanId.replaceAll("_", "-") + "-input";

    const questionId = inlineContext?.elementToQuestionMap?.[inlineInputId]?.questionId;
    const questionType = inlineContext?.elementToQuestionMap?.[inlineInputId]?.type ?? "isaacStringMatchQuestion";
    const questionDTO = selectQuestionPart(pageQuestions, questionId);

    const [elementIndex, _setElementIndex] = useState<number>(Object.keys(inlineContext?.elementToQuestionMap ?? {}).indexOf(inlineInputId));
    const [isSelectedFeedback, setIsSelectedFeedback] = useState<boolean>(false);

    const [modified, setModified] = useState(false);

    useEffect(() => {
        // only show the "Correct!" / "Incorrect" message once the last part submission has returned 
        if (inlineContext && questionDTO?.validationResponse) {
            setModified(false);
            // setPreviousAttempt(currentAttempt?.value);
            const elements = Object.keys(inlineContext.elementToQuestionMap);
            if (elements.indexOf(inlineInputId) === elements.length - 1) {
                inlineContext.setSubmitting(false);
                inlineContext.setModifiedQuestionIds([]);
                inlineContext.setIsModifiedSinceLastSubmission(false);
            }
        }
    }, [questionDTO?.validationResponse]);

    useEffect(() => {
        if (inlineContext && questionId) {
            inlineContext.setModifiedQuestionIds((m : string[]) => modified ? [...m, ...(m.includes(questionId) ? [] : [questionId])] : m.filter((e : string) => e !== questionId));
            inlineContext.setIsModifiedSinceLastSubmission(m => m || modified);
            inlineContext.setFeedbackIndex(undefined);
        }
    }, [modified]);

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
        console.error(`Inline question element (id: ${questionId}, dto: ${questionDTO}) not found.`);
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
                    valid={questionDTO?.validationResponse?.correct || (!modified && questionDTO?.bestAttempt?.correct)} 
                    invalid={questionDTO?.validationResponse?.correct === false || (!modified && questionDTO?.bestAttempt?.correct === false)} 
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
                    valid={questionDTO?.validationResponse?.correct || (!modified && questionDTO?.bestAttempt?.correct)} 
                    invalid={questionDTO?.validationResponse?.correct === false || (!modified && questionDTO?.bestAttempt?.correct === false)} 
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
export default InlineEntryZone;