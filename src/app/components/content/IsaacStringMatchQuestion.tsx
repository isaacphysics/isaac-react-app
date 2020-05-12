import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacStringMatchQuestionDTO} from "../../../IsaacApiTypes";
import {Input} from "reactstrap";
import {questions} from "../../state/selectors";


export const IsaacStringMatchQuestion = ({doc, questionId}: {doc: IsaacStringMatchQuestionDTO; questionId: string}) => {
    const dispatch = useDispatch();
    const questionPart = useSelector(questions.selectQuestionPart(questionId));
    const currentAttemptValue = questionPart?.currentAttempt?.value;

    return <div className="stringmatch-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <Input type={doc.multiLineEntry ? "textarea" : "text"} placeholder="Type your answer here."
            maxLength={doc.multiLineEntry ? 250 : 75}
            spellCheck={false} className="mb-4"
            rows={doc.multiLineEntry ? 3 : undefined}
            value={currentAttemptValue || ""}
            onChange={event =>
                dispatch(setCurrentAttempt(questionId, {type: "stringChoice", value: event.target.value}))
            }
        />
    </div>;
};
