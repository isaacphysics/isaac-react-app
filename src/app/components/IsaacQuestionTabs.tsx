import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../state/actions";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../state/reducers";
import {
    ChoiceDTO,
    ContentDTO,
    IsaacMultiChoiceQuestionDTO,
    QuestionDTO,
    QuestionValidationResponseDTO
} from "../../IsaacApiTypes";

const stateToProps = (state: AppState, {doc}: {doc: ContentDTO}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const question = state && state.questions && state.questions.filter((question) => question.id == doc.id)[0];
    return question ? {
        validationResponse: question.validationResponse,
        currentAttempt: question.currentAttempt,
        canSubmit: question.canSubmit
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

interface IsaacQuestionTabsProps {
    doc: IsaacMultiChoiceQuestionDTO, // Can assume id is always defined
    currentAttempt?: ChoiceDTO,
    canSubmit?: boolean,
    validationResponse?: QuestionValidationResponseDTO,
    registerQuestion: (question: QuestionDTO) => void,
    deregisterQuestion: (questionId: string) => void,
    attemptQuestion: (questionId: string, attempt: ChoiceDTO) => void,
}
const IsaacQuestionTabsComponent = (props: IsaacQuestionTabsProps) => {
    const {doc, currentAttempt, validationResponse, canSubmit, registerQuestion, deregisterQuestion, attemptQuestion} = props;

    useEffect((): (() => void) => {
        registerQuestion(doc);
        return () => deregisterQuestion(doc.id as string);
    }, [doc.id]);

    return <React.Fragment>
        <hr />

        // hints

        {/* switch question answer area on type */}
        <IsaacMultiChoiceQuestion questionId={doc.id as string} doc={doc}/>

        <hr />

        {validationResponse && !canSubmit && (validationResponse.correct ?
            <h1>Correct!</h1> :
            <h1>Incorrect</h1>)
        }
        {validationResponse && validationResponse.explanation && !canSubmit &&
            <IsaacContent doc={validationResponse.explanation} />
        }

        <div>
            <button onClick={() => currentAttempt && attemptQuestion(doc.id as string, currentAttempt)} disabled={!canSubmit}>
                Check my answer
            </button>
        </div>

        <hr />
    </React.Fragment>;
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsComponent);
