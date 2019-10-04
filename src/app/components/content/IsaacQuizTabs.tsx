import React, {useEffect} from "react";
import {connect} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacFreeTextQuestion} from "./IsaacFreeTextQuestion";
import {IsaacNumericQuestion} from "./IsaacNumericQuestion";
import {IsaacMultiChoiceQuestion} from "./IsaacMultiChoiceQuestion";
import {IsaacStringMatchQuestion} from "./IsaacStringMatchQuestion";
import {IsaacSymbolicLogicQuestion} from "./IsaacSymbolicLogicQuestion";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";
import {IsaacParsonsQuestion} from "./IsaacParsonsQuestion";
import {IsaacItemQuestion} from "./IsaacItemQuestion";
import {questions} from "../../state/selectors";

const stateToProps = (state: AppState, {doc}: {doc: ApiTypes.ContentDTO}) => {
    const indexedQuestion = questions.getQuestionPartAndIndex(doc.id)(state);
    return indexedQuestion ? {
        validationResponse: indexedQuestion.question.validationResponse,
        currentAttempt: indexedQuestion.question.currentAttempt,
        canSubmit: indexedQuestion.question.canSubmit && !indexedQuestion.question.locked,
        locked: indexedQuestion.question.locked,
        questionIndex: indexedQuestion.index
    } : {};
};
const dispatchToProps = {registerQuestion, deregisterQuestion, attemptQuestion};

interface IsaacQuizTabsProps {
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

const IsaacQuizTabsComponent = (props: IsaacQuizTabsProps) => {
    const {doc, registerQuestion, deregisterQuestion} = props;

    useEffect((): (() => void) => {
        registerQuestion(doc);
        return () => deregisterQuestion(doc.id as string);
    }, [doc.id]);

    let QuestionComponent;
    switch (doc.type) {
        case 'isaacNumericQuestion': QuestionComponent = IsaacNumericQuestion; break;
        case 'isaacStringMatchQuestion': QuestionComponent = IsaacStringMatchQuestion; break;
        case 'isaacFreeTextQuestion': QuestionComponent = IsaacFreeTextQuestion; break;
        case 'isaacItemQuestion': QuestionComponent = IsaacItemQuestion; break;
        case 'isaacMultiChoiceQuestion': default: QuestionComponent = IsaacMultiChoiceQuestion; break;
        case 'isaacParsonsQuestion': QuestionComponent = IsaacParsonsQuestion; break;
        case 'isaacSymbolicLogicQuestion': QuestionComponent = IsaacSymbolicLogicQuestion; break;
    }

    let extraClasses = "";
    if (doc.type === 'isaacParsonsQuestion') {
        extraClasses += "parsons-layout ";
    }

    return <React.Fragment>
        <div className={`question-component p-md-5 ${extraClasses}`}>
            <QuestionComponent questionId={doc.id as string} doc={doc} />
        </div>
    </React.Fragment>;
};

export const IsaacQuizTabs = connect(stateToProps, dispatchToProps)(IsaacQuizTabsComponent);
