import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacMultiChoiceQuestionDTO} from "../../../IsaacApiTypes";
import {CustomInput, Label} from "reactstrap";
import {useCurrentQuestionAttempt} from "../../services/questions";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

export const IsaacMultiChoiceQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacMultiChoiceQuestionDTO>) => {

    const { currentAttempt, setCurrentAttempt } = useCurrentQuestionAttempt(questionId);

    return <div className="multichoice-question">
        <div className="question-content">
            <IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </div>
        <ul>{doc?.choices?.map((choice, index) =>
            <li key={choice.value} className="list-unstyled">
                <Label className="label-radio multichoice-option d-flex">
                    <CustomInput
                        id={`${questionId}${index}`} color="secondary" type="radio"
                        checked={currentAttempt?.value === choice.value}
                        onChange={() => setCurrentAttempt(questionId, choice)}
                        disabled={readonly}
                    />
                    <div className="flex-fill">
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} />
                    </div>
                </Label>
            </li>)}
        </ul>
    </div>;
};
