import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../redux/actions";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacContent} from "./IsaacContent";

const stateToProps = ({questions}: any, {doc}: any) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = questions.filter((question: any) => question.id == doc.id)[0];
    return (question) ? {
        validationResponse: question.validationResponse,
        currentAttempt: question.currentAttempt,
        canSubmit: question.canSubmit
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

const IsaacQuestionTabsContainer = (props: any) => {
    const {
        doc, currentAttempt, validationResponse, canSubmit,
        registerQuestion, deregisterQuestion, attemptQuestion
    } = props;

    useEffect((): () => void =>{
        registerQuestion(doc);
        return () => deregisterQuestion(doc.id);
    }, [doc.id]);

    // switch question answer area on type
    return (
        <React.Fragment>
            <hr />

            // hints
            <IsaacMultiChoiceQuestion {...props} questionId={doc.id} />

            <hr />

            {validationResponse && (validationResponse.correct ? <h1>Correct!</h1> : <h1>Incorrect</h1>)}
            {validationResponse && <IsaacContent doc={validationResponse.explanation} />}
            <div>
                <button
                    onClick={() => attemptQuestion(doc.id, currentAttempt)}
                    disabled={!canSubmit}
                >
                    Check my answer
                </button>
            </div>

            <hr />
        </React.Fragment>
    );
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsContainer);
