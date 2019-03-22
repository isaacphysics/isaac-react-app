import React, {useEffect} from "react";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../redux/actions";
import {connect} from "react-redux";
import {IsaacContent} from "./IsaacContent";

const stateToProps = ({questions}: any, {doc}: any) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = questions.filter((question: any) => question.id == doc.id)[0];
    return (question) ? {
        validationResponse: question.validationResponse,
        bestAttempt: question.bestAttempt,
        currentAttempt: question.currentAttempt
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

const IsaacQuestionTabsContainer = (props: any) => {
    const {
        doc, currentAttempt, bestAttempt, validationResponse,
        registerQuestion, deregisterQuestion, attemptQuestion
    } = props;

    useEffect((): () => void =>{
        registerQuestion(doc);
        return function cleanup() {
            deregisterQuestion(doc.id);
        }
    }, [doc.id]);

    const currentAttemptTemp = {"type":"choice","encoding":"markdown","children":[],"value":"The weight of the block and the reaction force from the ground on the block.","published":false};
    bestAttempt && console.log("TODO MT best attempt registered:", bestAttempt);

    // switch question answer area on type
    return (
        <div>
            <hr />

            // hints

            <IsaacMultiChoiceQuestion {...props}/>

            {validationResponse && (validationResponse.correct ? <div>Correct!</div> : <div>Incorrect</div>)}
            {validationResponse && <IsaacContent doc={validationResponse.explanation} />}

            <div>
                <button onClick={() => attemptQuestion(doc.id, currentAttemptTemp)}>
                    Check my answer
                </button>
            </div>

            <hr />
        </div>
    );
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsContainer);
