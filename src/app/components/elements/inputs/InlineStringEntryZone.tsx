import React, { useEffect, useState } from "react";
import { Input } from "reactstrap";
import { IsaacStringMatchQuestionDTO, StringChoiceDTO } from "../../../../IsaacApiTypes";
import { useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import classNames from "classnames";

export const InlineStringEntryZone = ({width, height, questionDTO, focusRef, setModified, correctness, ...rest} : InlineEntryZoneProps<IsaacStringMatchQuestionDTO>) => {
    
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

    return <div className={"feedback-zone inline-nq-feedback"}>
        <Input 
            {...rest}
            className={classNames("force-print", rest.className, correctnessClass(correctness))}
            ref={focusRef}
            value={value}
            style={{width: `${width}px`, height: `${height}px`}}
            onChange={(e) => setValue(e.target.value)}
        />
        {(correctness === "NOT_ANSWERED" || correctness === "INCORRECT") && <div className={"feedback-box"}>
            {correctness === "NOT_ANSWERED" ? 
                <span className={"feedback unanswered"}><b>!</b></span> : 
                <span className={"feedback incorrect"}>✘</span>
            }
        </div>}
    </div>;
};