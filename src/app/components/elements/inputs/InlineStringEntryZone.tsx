import React, { useEffect, useState } from "react";
import { Input, InputProps } from "reactstrap";
import { IsaacStringMatchQuestionDTO, StringChoiceDTO } from "../../../../IsaacApiTypes";
import { useCurrentQuestionAttempt } from "../../../services";

interface InlineStringEntryZoneProps extends InputProps {
    width: number, 
    height: number, 
    questionDTO: IsaacStringMatchQuestionDTO,
    setModified: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InlineStringEntryZone = ({width, height, questionDTO, setModified, ...props} : InlineStringEntryZoneProps) => {
    
    const questionId = questionDTO?.id ?? "";
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId as string);

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
        value={value}
        style={{width: `${width}px`, height: `${height}px`}}
        onChange={(e) => setValue(e.target.value)}
    />;
};