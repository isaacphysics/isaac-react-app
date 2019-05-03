import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacStringMatchQuestion} from "./IsaacStringMatchQuestion";
import {IsaacSymbolicLogicQuestion} from "./IsaacSymbolicLogicQuestion";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";
import {Button} from "reactstrap";

const stateToProps = (state: AppState, {doc}: {doc: ApiTypes.ContentDTO}) => {
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
    doc: ApiTypes.IsaacQuestionBaseDTO, // Can assume id is always defined
    currentAttempt?: ApiTypes.ChoiceDTO,
    canSubmit?: boolean,
    validationResponse?: ApiTypes.QuestionValidationResponseDTO,
    registerQuestion: (question: ApiTypes.QuestionDTO) => void,
    deregisterQuestion: (questionId: string) => void,
    attemptQuestion: (questionId: string, attempt: ApiTypes.ChoiceDTO) => void,
}
const IsaacQuestionTabsComponent = (props: IsaacQuestionTabsProps) => {
    const {doc, currentAttempt, validationResponse, canSubmit, registerQuestion, deregisterQuestion, attemptQuestion} = props;

    useEffect((): (() => void) => {
        registerQuestion(doc);
        return () => deregisterQuestion(doc.id as string);
    }, [doc.id]);

    let QuestionBlock: JSX.Element;
    switch (doc.type) {
    case 'isaacSymbolicLogicQuestion':
        QuestionBlock = <IsaacSymbolicLogicQuestion questionId={doc.id as string} doc={doc} />;
        break;
    case 'isaacStringMatchQuestion':
        QuestionBlock = <IsaacStringMatchQuestion questionId={doc.id as string} doc={doc} />;
        break;
    case 'isaacMultiChoiceQuestion':
    default:
        QuestionBlock = <IsaacMultiChoiceQuestion questionId={doc.id as string} doc={doc} />;
        break;
    }

    return <React.Fragment>
        <hr />

        // hints

        {/* switch question answer area on type */}
        {QuestionBlock}

        <hr />

        {validationResponse && !canSubmit && (validationResponse.correct ?
            <h1>Correct!</h1> :
            <h1>Incorrect</h1>)
        }
        {validationResponse && validationResponse.explanation && !canSubmit &&
            <IsaacContent doc={validationResponse.explanation} />
        }

        <div>
            <Button color="primary" onClick={() => currentAttempt && attemptQuestion(doc.id as string, currentAttempt)} disabled={!canSubmit}>
                Check my answer
            </Button>
        </div>

        <hr />
    </React.Fragment>;
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsComponent);
