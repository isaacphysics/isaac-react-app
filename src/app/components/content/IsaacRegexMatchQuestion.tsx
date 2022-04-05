import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacRegexMatchQuestionDTO} from "../../../IsaacApiTypes";
import {Input} from "reactstrap";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

export const IsaacRegexMatchQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacRegexMatchQuestionDTO>) => {

    const { currentAttempt, setCurrentAttempt } = useCurrentQuestionAttempt(questionId);

    return <div className="regexmatch-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <Input type={doc.multiLineEntry ? "textarea" : "text"} placeholder="Type your answer here."
            maxLength={doc.multiLineEntry ? 250 : 75}
            spellCheck={false} className="mb-4"
            rows={doc.multiLineEntry ? 3 : undefined}
            value={currentAttempt?.value ?? ""}
            onChange={event =>
                setCurrentAttempt(questionId, {type: "stringChoice", value: event.target.value})
            }
            readOnly={readonly}
        />
    </div>;
};
