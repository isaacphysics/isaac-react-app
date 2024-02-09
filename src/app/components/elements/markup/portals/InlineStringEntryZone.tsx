import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Input } from "reactstrap";
import { useCurrentQuestionAttempt } from "../../../../services";
import { StringChoiceDTO } from "../../../../../IsaacApiTypes";
import { InlineStringEntryZoneContext } from "../../../../../IsaacAppTypes";

const InlineStringEntryZone = ({inlineElementId, width, height, root}: {inlineElementId: string, width: number, height: number, root: HTMLElement}) => {
    
    const inlineContext = useContext(InlineStringEntryZoneContext);

    const questionId = inlineContext?.elementToQuestionMap?.[inlineElementId].questionId;
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId ?? "");

    const [attempt, setAttempt] = useState(currentAttempt?.value ?? "");

    useEffect(() => {
        dispatchSetCurrentAttempt({type: "stringChoice", value: attempt});
        if (inlineContext) {
            // Clear validation for this inline part; any unvalidated parts will be re-validated when the user submits the overall region
            inlineContext.elementToQuestionMap[inlineElementId].attempt = attempt;
        } else {
            console.warn("No inline context found for", questionId);
        }
    }, [attempt]);
    
    const inlineStringEntryZone = root?.querySelector(`#${inlineElementId}`);

    if (!inlineStringEntryZone) {
        console.error("Inline string entry zone not found for id", inlineElementId);
        return null;
    }

    return <>
        {ReactDOM.createPortal(
            <Input id={inlineElementId} style={{width: `${width}px`, height: `${height}px`}}
            onChange={(e) => setAttempt(e.target.value)} />,
            inlineStringEntryZone
        )}
    </>;
};
export default InlineStringEntryZone;