import React from "react";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacMultiChoiceQuestionDTO} from "../../../IsaacApiTypes";
import {CustomInput, Label} from "reactstrap";
import {useCurrentQuestionAttempt} from "../../services";
import {IsaacQuestionProps} from "../../../IsaacAppTypes";

const IsaacMultiChoiceQuestion = ({doc, questionId, readonly}: IsaacQuestionProps<IsaacMultiChoiceQuestionDTO>) => {

    const { currentAttempt, dispatchSetCurrentAttempt } = useCurrentQuestionAttempt(questionId);

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
                        onChange={() => dispatchSetCurrentAttempt(choice)}
                        disabled={readonly}
                    />
                    <div className="flex-fill overflow-x-auto">
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} />
                    </div>
                </Label>
            </li>)}
        </ul>
    </div>;
};
export default IsaacMultiChoiceQuestion;
