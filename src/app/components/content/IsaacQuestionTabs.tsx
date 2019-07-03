import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacFreeTextQuestion} from "./IsaacFreeTextQuestion";
import {IsaacNumericQuestion} from "./IsaacNumericQuestion";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacStringMatchQuestion} from "./IsaacStringMatchQuestion";
import {IsaacSymbolicLogicQuestion} from "./IsaacSymbolicLogicQuestion";
import {Alert, Button, Col, Row} from "reactstrap";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";
import { IsaacParsonsQuestion } from "./IsaacParsonsQuestion";
import {DATE_TIME_FORMATTER} from "../../services/constants";

const stateToProps = (state: AppState, {doc}: {doc: ApiTypes.ContentDTO}) => {
    // TODO MT move this selector to the reducer - https://egghead.io/lessons/javascript-redux-colocating-selectors-with-reducers
    const indexedQuestion = state && state.questions &&
        state.questions
            .map((question, index) => ({question, index}))
            .filter(({question}) => question.id == doc.id)[0];
    return indexedQuestion ? {
        validationResponse: indexedQuestion.question.validationResponse,
        currentAttempt: indexedQuestion.question.currentAttempt,
        canSubmit: indexedQuestion.question.canSubmit && !indexedQuestion.question.locked,
        locked: indexedQuestion.question.locked,
        questionIndex: indexedQuestion.index
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

interface IsaacQuestionTabsProps {
    doc: ApiTypes.IsaacQuestionBaseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
    locked?: Date;
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    questionIndex?: number;
    registerQuestion: (question: ApiTypes.QuestionDTO) => void;
    deregisterQuestion: (questionId: string) => void;
    attemptQuestion: (questionId: string, attempt: ApiTypes.ChoiceDTO) => void;
}

function showTime(date: Date) {
    return DATE_TIME_FORMATTER.format(date);
}

const IsaacQuestionTabsComponent = (props: IsaacQuestionTabsProps) => {
    const {doc, currentAttempt, validationResponse, questionIndex, canSubmit, locked, registerQuestion, deregisterQuestion, attemptQuestion} = props;

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
        case 'isaacParsonsQuestion': QuestionComponent = IsaacParsonsQuestion; break;
        case 'isaacMultiChoiceQuestion': default: QuestionComponent = IsaacMultiChoiceQuestion; break;
    }

    let extraClasses = "";
    if (doc.type === 'isaacParsonsQuestion') {
        extraClasses += "parsons-layout ";
    }

    return <React.Fragment>
        {/* <h2 className="h-question d-flex pb-3">
            <span className="mr-3">{questionIndex !== undefined ? `Q${questionIndex + 1}` : "Question"}</span>
        </h2> */}

        {/* Difficulty bar */}
        <div className={`question-component p-md-5 ${extraClasses}`}>
            <QuestionComponent questionId={doc.id as string} doc={doc} />

            {validationResponse && !canSubmit && <div className="validation-response-panel">
                <div className="my-3">
                    {validationResponse.correct ?
                        <h1 className="m-0">Correct!</h1> :
                        <h1 className="m-0">Incorrect</h1>
                    }
                </div>
                <div>
                    {validationResponse.explanation &&
                        <IsaacContent doc={validationResponse.explanation} />
                    }
                </div>
            </div>}

            {locked && <Alert color="danger">
                This question is locked until at least {showTime(locked)} to prevent repeated guessing.
            </Alert>}

            {((!validationResponse) || (validationResponse && !validationResponse.correct) || canSubmit) && (!locked) && <Row>
                <Col className="text-center pt-3 pb-1">
                    <Button color="secondary" disabled={!canSubmit} onClick={submitCurrentAttempt}>
                        Check my answer
                    </Button>
                </Col>
            </Row>}

            {((!validationResponse) || (validationResponse && !validationResponse.correct) || canSubmit) && <Row>
                <Col xl={{size: 10, offset: 1}} >
                    {doc.hints && <p className="text-center pt-2 mb-0">
                        <small>Don&apos;t forget to use the hints above if you need help.</small>
                    </p>}
                </Col>
            </Row>}
        </div>
    </React.Fragment>;
};

export const IsaacQuestionTabs = connect(stateToProps, dispatchToProps)(IsaacQuestionTabsComponent);
