import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../state/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

const stateToProps = ({questions}: any, {questionId}: any) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = questions.filter((question: any) => question.id == questionId)[0];
    return (question) ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

const IsaacMultiChoiceQuestionComponent = ({doc, questionId, currentAttempt, setCurrentAttempt}: any) => {
    const currentAttemptValue = currentAttempt && currentAttempt.value;
    return (
        <div>
            <h3><IsaacContentValueOrChildren value={doc.value} encoding={doc.encoding} children={doc.children} /></h3>
            <ul>{doc.choices.map((choice: any, index: number) =>
                <li key={index}>
                    <input
                        type="radio"
                        checked={currentAttemptValue == choice.value}
                        onClick={() => setCurrentAttempt(questionId, choice)}
                        readOnly
                    />
                    <label>
                        <IsaacContentValueOrChildren value={choice.value} encoding={doc.encoding} children={[]} />
                    </label>
                </li>)
            }</ul>
        </div>
    );
};

export const IsaacMultiChoiceQuestion = connect(stateToProps, dispatchToProps)(IsaacMultiChoiceQuestionComponent);
