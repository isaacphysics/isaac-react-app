import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {IsaacMultiChoiceQuestionDTO} from "../../../IsaacApiTypes";
import {CustomInput, Label} from "reactstrap";
import {questions} from "../../state/selectors";

interface IsaacMultiChoiceQuestionProps {
    doc: IsaacMultiChoiceQuestionDTO;
    questionId: string;
}
export const IsaacMultiChoiceQuestion = ({doc, questionId}: IsaacMultiChoiceQuestionProps) => {
    const dispatch = useDispatch();
    const questionPart = useSelector(questions.selectQuestionPart(questionId));
    const currentAttemptValue = questionPart?.currentAttempt?.value;

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
                        checked={currentAttemptValue == choice.value}
                        onChange={() => dispatch(setCurrentAttempt(questionId, choice))}
                    />
                    <div className="flex-fill">
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} />
                    </div>
                </Label>
            </li>)}
        </ul>
    </div>;
};
