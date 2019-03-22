import React from "react";
import {connect} from "react-redux";
import {setCurrentAttempt} from "../redux/actions";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

const stateToProps = ({questions}: any, {questionId}: any) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = questions.filter((question: any) => question.id == questionId)[0];
    return (question) ? {currentAttempt: question.currentAttempt} : {};
};
const dispatchToProps = {setCurrentAttempt};

const IsaacMultiChoiceQuestionContainer = (props: any) => {
    const {
        doc: {value, encoding, children, choices},
        questionId, currentAttempt,
        setCurrentAttempt
    } = props;

    return (
        <div>
            <h3><IsaacContentValueOrChildren value={value} encoding={encoding} children={children} /></h3>
            <ul>{choices.map((choice: any, index: number) =>
                <li key={index}>
                    <input
                        type="radio"
                        checked={currentAttempt == choice}
                        onClick={() => setCurrentAttempt(questionId, choice)}
                        readOnly
                    />
                    <label>
                        <IsaacContentValueOrChildren value={choice.value} encoding={encoding} children={[]} />
                    </label>
                </li>)
            }</ul>
        </div>
    );
};

export const IsaacMultiChoiceQuestion = connect(stateToProps, dispatchToProps)(IsaacMultiChoiceQuestionContainer);
