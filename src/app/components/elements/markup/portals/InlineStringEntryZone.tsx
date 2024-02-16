import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Input } from "reactstrap";
import { selectQuestionPart, useCurrentQuestionAttempt } from "../../../../services";
import { StringChoiceDTO } from "../../../../../IsaacApiTypes";
import { InlineStringEntryZoneContext } from "../../../../../IsaacAppTypes";
import { selectors, useAppSelector } from "../../../../state";

const InlineStringEntryZone = ({inlineElementId, width, height, root}: {inlineElementId: string, width: number, height: number, root: HTMLElement}) => {
    
    const inlineContext = useContext(InlineStringEntryZoneContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);

    const safeElementId = inlineElementId.replaceAll("_", "-");

    const questionId = inlineContext?.elementToQuestionMap?.[safeElementId].questionId;
    const questionDTO = selectQuestionPart(pageQuestions, questionId);
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId as string);

    const [modified, setModified] = useState(false);

    useEffect(() => {
        if (inlineContext) {
            inlineContext.setModified(m => m || modified);
        }
    }, [inlineContext, modified]);

    useEffect(() => {
        // only show the "Correct!" / "Incorrect" message once the last part submission has returned 
        if (inlineContext) {
            const elements = Object.keys(inlineContext.elementToQuestionMap);
            if (elements.indexOf(safeElementId) === elements.length - 1) {
                inlineContext.setSubmitting(false);
            }
        }
    }, [questionDTO?.validationResponse]);

    const inlineStringEntryZone = root?.querySelector(`#${inlineElementId}`);

    if (!inlineStringEntryZone) {
        console.error("Inline string entry zone not found for id", inlineElementId);
        return null;
    }

    return <>
        {ReactDOM.createPortal(
            <Input 
                valid={questionDTO?.validationResponse?.correct || (!modified && questionDTO?.bestAttempt?.correct)} 
                invalid={questionDTO?.validationResponse?.correct === false || (!modified && questionDTO?.bestAttempt?.correct === false)} 
                id={inlineElementId} 
                style={{width: `${width}px`, height: `${height}px`}}
                className="inline-part"
                value={currentAttempt?.value ?? ""}
                onChange={(e) => {
                    if (inlineContext) {
                        inlineContext.canSubmit = true;
                    }
                    setModified(true);
                    dispatchSetCurrentAttempt({type: "stringChoice", value: e.target.value});
                }} 
            />,
            inlineStringEntryZone
        )}
    </>;
};
export default InlineStringEntryZone;