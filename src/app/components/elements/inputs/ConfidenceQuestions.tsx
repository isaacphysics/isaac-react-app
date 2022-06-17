import {Button, Col, Row} from "reactstrap";
import React, {useRef} from "react";
import {closeActiveModal, logAction, openActiveModal} from "../../../state/actions";
import {useDispatch} from "react-redux";
import {ConfidenceType} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isCS, isPhy, siteSpecific} from "../../../services/siteConstants";
import {store} from "../../../state/store";
import {v4 as uuid_v4} from "uuid";

type ActiveConfidenceState = "initial" | "followUp"
export type ConfidenceState = ActiveConfidenceState | "hidden";

interface ConfidenceVariables {
    title: string;
    states: {
        [state in ActiveConfidenceState]: {
            question: string;
            options: {
                label: string;
                color: string;
            }[];
        }
    }
}

// Text to show in the confidence component depending on the type of content
const confidenceOptions: {[option in ConfidenceType]: ConfidenceVariables} = {
    "question": {
        title: "Click a button to check your answer",
        states: {
            initial: {
                question: "What is your level of confidence that your own answer is correct?",
                options: [
                    {label: "Low", color: "negative"},
                    {label: "Medium", color: "neutral"},
                    {label: "High", color: "positive"}
                ]
            },
            followUp: {
                question: "Having read the feedback, do you feel more confident in answering this question?",
                options: [
                    {label: "No", color: siteSpecific("negative", "negative-answer")},
                    {label: "Partly", color: siteSpecific("neutral", "neutral-answer")},
                    {label: "Yes", color: siteSpecific("positive", "positive-answer")}
                ]
            }
        }
    },
    "quick_question": {
        title: "Click a button to show the answer",
        states: {
            initial: {
                question: "What is your level of confidence that your own answer is correct?",
                options: [
                    {label: "Low", color: "negative"},
                    {label: "Medium", color: "neutral"},
                    {label: "High", color: "positive"}
                ]
            },
            followUp: {
                question: "Is your own answer correct?",
                options: [
                    {label: "No", color: siteSpecific("negative", "negative-answer")},
                    {label: "Partly", color: siteSpecific("neutral", "neutral-answer")},
                    {label: "Yes", color: siteSpecific("positive", "positive-answer")}
                ]
            }
        }
    }
};

interface ConfidenceQuestionsProps {
    state: ConfidenceState;
    setState: (cs: ConfidenceState) => void;
    identifier: any;
    disabled?: boolean;
    attemptUuid: React.MutableRefObject<string>;
    type: ConfidenceType;
    correct?: boolean;
    answer?: any;
}

const confidenceInformationModal = () => openActiveModal({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Information",
    body: <div className="mb-4">
        We regularly review and update the Isaac platform’s content and would like your input in order to
        prioritise content and assess the impact of updates. Data captured with these buttons will help us
        identify priority areas.
    </div>
});

export const ConfidenceQuestions = ({state, setState, attemptUuid, disabled, identifier, type, correct, answer}: ConfidenceQuestionsProps) => {
    const dispatch = useDispatch();

    const toggle = (confidence: string, state: ActiveConfidenceState) => {
        const stateAndType: `${ActiveConfidenceState} & ${ConfidenceType}` = `${state} & ${type}`;
        switch (stateAndType) {
            case "initial & question":
            case "initial & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_BEFORE",
                    questionId: identifier,
                    attemptUuid: attemptUuid.current,
                    questionConfidence: confidence
                }));
                setState("followUp");
                break;
            case "followUp & question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_AFTER",
                    questionId: identifier,
                    attemptUuid: attemptUuid.current,
                    answer: answer,
                    answerCorrect: correct,
                    answerConfidence: confidence
                }));
                setState("hidden");
                break;
            case "followUp & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_AFTER",
                    questionId: identifier,
                    attemptUuid: attemptUuid.current,
                    answerConfidence: confidence
                }));
                setState("hidden");
                break;
        }
    };

    if (state === "hidden") return null;

    const confidenceVariables = confidenceOptions[type];
    const confidenceStateVariables = confidenceVariables?.states[state];

    return <div className={classNames("quick-question-options", {"quick-question-secondary": isCS && state === "followUp", "pb-lg-3 pb-2 pt-lg-4 pt-3 px-lg-4 px-3": isPhy, "p-3": isCS})}>
        {state === "initial" && <Row>
            <Col md="9">
                <h4>{confidenceVariables?.title}</h4>
            </Col>
            <Col md="auto" className="ml-auto text-center not-mobile">
                <Button outline color="primary" className="confidence-help" size="sm"
                        onClick={() => dispatch(confidenceInformationModal())}>
                    <i>i</i>
                </Button>
            </Col>
        </Row>}
        <Row className="mb-3">
            <Col>
                {confidenceStateVariables.question}
            </Col>
        </Row>
        <Row className={"justify-content-center"}>
            {confidenceStateVariables.options.map(option => <Col className={classNames("mx-auto", {"mb-2": isPhy})}>
                <Button color={option.color} disabled={state === "initial" && disabled} block
                        className={classNames({"active": state === "followUp"})} type="submit"
                        onClick={() => toggle(option.label, state)}>
                    {option.label}
                </Button>
            </Col>)}
        </Row>
    </div>;
};
