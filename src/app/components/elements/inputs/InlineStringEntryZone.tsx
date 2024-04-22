import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";
import { IsaacStringMatchQuestionDTO, StringChoiceDTO } from "../../../../IsaacApiTypes";
import { useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps } from "../markup/portals/InlineEntryZone";

export const InlineStringEntryZone = ({width, height, questionDTO, focusRef, setModified, ...props} : InlineEntryZoneProps<IsaacStringMatchQuestionDTO>) => {
    
    const questionId = questionDTO?.id ?? "";
    const { currentAttempt: _, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId as string);

    const [value, setValue] = useState<string | undefined>(questionDTO?.bestAttempt?.answer?.value);

    useEffect(function updateCurrentAttempt() {
        const attempt = {
            type: "stringChoice",
            value: value,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }, [value]);

    return <Input 
        {...props}
        ref={focusRef}
        value={value}
        style={{width: `${width}px`, height: `${height}px`}}
        onChange={(e) => setValue(e.target.value)}
    />;
};