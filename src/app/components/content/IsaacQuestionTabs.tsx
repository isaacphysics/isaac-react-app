import React, {useContext, useEffect} from "react";
import {connect, useDispatch} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";
import {questions} from "../../state/selectors";
import classnames from "classnames";
import * as RS from "reactstrap";
import {QUESTION_TYPES} from "../../services/questions";
import {DateString, NUMERIC_DATE_AND_TIME} from "../elements/DateString";
import {AccordionSectionContext} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState, {doc}: {doc: ApiTypes.ContentDTO}) => {
    const questionPart = questions.selectQuestionPart(doc.id)(state);
    return questionPart ? {
        validationResponse: questionPart.validationResponse,
        currentAttempt: questionPart.currentAttempt,
        canSubmit: questionPart.canSubmit && !questionPart.locked,
        locked: questionPart.locked
    } : {};
};

interface IsaacQuestionTabsProps {
    doc: ApiTypes.IsaacQuestionBaseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
    locked?: Date;
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
}

const IsaacQuestionTabsComponent = (props: IsaacQuestionTabsProps) => {
    const {doc, validationResponse, currentAttempt, canSubmit, locked} = props;
    const dispatch = useDispatch();

    const accordion = useContext(AccordionSectionContext);

    useEffect((): (() => void) => {
        dispatch(registerQuestion(doc, accordion.clientId));
        return () => dispatch(deregisterQuestion(doc.id as string));
    }, [doc.id]);

    function submitCurrentAttempt(event: React.FormEvent) {
        if (event) {event.preventDefault();}
        if (currentAttempt) {
            dispatch(attemptQuestion(doc.id as string, currentAttempt));
        }
    }

    const QuestionComponent = QUESTION_TYPES.get(doc.type) || QUESTION_TYPES.get("default");

    const sigFigsError = validationResponse && validationResponse.explanation &&
        (validationResponse.explanation.tags || []).includes("sig_figs");

    return <RS.Form onSubmit={submitCurrentAttempt}>
        {/* <h2 className="h-question d-flex pb-3">
            <span className="mr-3">{questionIndex !== undefined ? `Q${questionIndex + 1}` : "Question"}</span>
        </h2> */}

        {/* Difficulty bar */}

        <div className={
            classnames({"question-component p-md-5": true, "parsons-layout": doc.type === 'isaacParsonsQuestion'})
        }>
            <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} />

            {validationResponse && !canSubmit && <div className={
                classnames({"validation-response-panel p-3 mt-3": true,  "correct": validationResponse.correct})
            }>
                <div className="pb-1">
                    <h1 className="m-0">{sigFigsError ? "Significant Figures" : validationResponse.correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                <div>
                    {validationResponse.explanation && <IsaacContent doc={validationResponse.explanation} />}
                </div>
                {/*{SITE_SUBJECT === SITE.PHY && <div className="pt-1">*/}
                {/*    <div className="m-0 question-response">{validationResponse.correct ? "Well done!" : "Please try again."}</div>*/}
                {/*</div>}*/}
            </div>}

            {locked && <RS.Alert color="danger">
                This question is locked until at least {<DateString formatter={NUMERIC_DATE_AND_TIME}>{locked}</DateString>} to prevent repeated guessing.
            </RS.Alert>}

            {((!validationResponse) || (!validationResponse.correct) || canSubmit) && (!locked) && <RS.Row>
                <RS.Col className="text-center pt-3 pb-1">
                    <input
                        type="submit" className="btn btn-secondary border-0"
                        disabled={!canSubmit} value="Check my answer"
                    />
                </RS.Col>
            </RS.Row>}

            {((!validationResponse) || (!validationResponse.correct) || canSubmit) && <RS.Row>
                <RS.Col xl={{size: 10, offset: 1}} >
                    {doc.hints && <p className="no-print text-center pt-2 mb-0">
                        <small>{"Don't forget to use the hints above if you need help."}</small>
                    </p>}
                </RS.Col>
            </RS.Row>}
        </div>
    </RS.Form>;
};

export const IsaacQuestionTabs = connect(stateToProps)(IsaacQuestionTabsComponent);
