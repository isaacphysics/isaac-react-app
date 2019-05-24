import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacFreeTextQuestion} from "./IsaacFreeTextQuestion";
import {IsaacNumericQuestion} from "./IsaacNumericQuestion";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacStringMatchQuestion} from "./IsaacStringMatchQuestion";
import {IsaacSymbolicLogicQuestion} from "./IsaacSymbolicLogicQuestion";
import {Button, Col, Row} from "reactstrap";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";

const stateToProps = (state: AppState, {doc}: {doc: ApiTypes.ContentDTO}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const indexedQuestion = state && state.questions &&
        state.questions
            .map((question, index) => ({question, index}))
            .filter(({question}) => question.id == doc.id)[0];
    return indexedQuestion ? {
        validationResponse: indexedQuestion.question.validationResponse,
        currentAttempt: indexedQuestion.question.currentAttempt,
        canSubmit: indexedQuestion.question.canSubmit,
        questionIndex: indexedQuestion.index
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

interface IsaacQuestionTabsProps {
    doc: ApiTypes.IsaacQuestionBaseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    questionIndex?: number;
    registerQuestion: (question: ApiTypes.QuestionDTO) => void;
    deregisterQuestion: (questionId: string) => void;
    attemptQuestion: (questionId: string, attempt: ApiTypes.ChoiceDTO) => void;
}

const IsaacQuestionTabsComponent = (props: IsaacQuestionTabsProps) => {
    const {doc, currentAttempt, validationResponse, questionIndex, canSubmit, registerQuestion, deregisterQuestion, attemptQuestion} = props;

    useEffect((): (() => void) => {
        registerQuestion(doc);
        return () => deregisterQuestion(doc.id as string);
    }, [doc.id]);

    const submitCurrentAttempt = () => currentAttempt && attemptQuestion(doc.id as string, currentAttempt);

    let QuestionComponent;
    switch (doc.type) {
        case 'isaacFreeTextQuestion': QuestionComponent = IsaacFreeTextQuestion; break;
        case 'isaacNumericQuestion': QuestionComponent = IsaacNumericQuestion; break;
        case 'isaacSymbolicLogicQuestion': QuestionComponent = IsaacSymbolicLogicQuestion; break;
        case 'isaacStringMatchQuestion': QuestionComponent = IsaacStringMatchQuestion; break;
        case 'isaacMultiChoiceQuestion': default: QuestionComponent = IsaacMultiChoiceQuestion; break;
    }

    return <React.Fragment>
        <h2 className="h-question d-flex pb-3">
            <span className="mr-3">{questionIndex !== undefined ? `Q${questionIndex + 1}` : "Question"}</span>
        </h2>

        {/* Difficulty bar */}

        <div className="question-component p-md-5">
            <QuestionComponent questionId={doc.id as string} doc={doc} />

            {validationResponse && !canSubmit && (validationResponse.correct ?
                <h1>Correct!</h1> :
                <h1>Incorrect</h1>)
            }

            {validationResponse && validationResponse.explanation && !canSubmit &&
                <IsaacContent doc={validationResponse.explanation} />
            }

            <Row>
                <Col sm="12" md={{ size: 6, offset: 3 }}>
                    <Button color="secondary" disabled={!canSubmit} block onClick={submitCurrentAttempt}>
                        Check my answer
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col sm="12" md={{size: 4, offset: 4}} >
                    <p className="text-center pt-2">
                        <small>Don&apos;t forget to use the hints above if you need help.</small>
                    </p>
                </Col>
            </Row>
        </div>
    </React.Fragment>;
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsComponent);
