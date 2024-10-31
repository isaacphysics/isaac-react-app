import React from "react";
import { Input } from "reactstrap";
import { IsaacStringMatchQuestionDTO, StringChoiceDTO } from "../../../../IsaacApiTypes";
import { useCurrentQuestionAttempt } from "../../../services";
import { InlineEntryZoneProps, correctnessClass } from "../markup/portals/InlineEntryZone";
import classNames from "classnames";

export const InlineStringEntryZone = ({questionDTO, focusRef, setModified, correctness, contentClasses, contentStyle, ...rest} : InlineEntryZoneProps<IsaacStringMatchQuestionDTO>) => {
    
    const questionId = questionDTO?.id ?? "";
    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt<StringChoiceDTO>(questionId as string);

    function updateCurrentAttempt({newValue} : {newValue?: string}) {
        const attempt = {
            type: "stringChoice",
            value: newValue ?? currentAttempt?.value,
        };
        dispatchSetCurrentAttempt(attempt);
        setModified(true);
    }

    return <div className={classNames("inline-string-container", rest.className)}>
        <div className="feedback-wrapper w-100 h-100">
            <Input 
                {...rest}
                className={classNames(
                    contentClasses,
                    "force-print",
                    correctnessClass(correctness)
                )}
                style={contentStyle}
                ref={focusRef}
                value={currentAttempt?.value ?? ""}
                onChange={(e) => updateCurrentAttempt({newValue: e.target.value})}
            />
        </div>
    </div>;
};
