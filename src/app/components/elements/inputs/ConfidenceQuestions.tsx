import {Button, Col, Row} from "reactstrap";
import React, {useEffect, useRef, useState} from "react";
import {closeActiveModal, logAction, openActiveModal} from "../../../state/actions";
import {useDispatch} from "react-redux";
import {ConfidenceType} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isCS, isPhy, siteSpecific} from "../../../services/siteConstants";
import {store} from "../../../state/store";
import {v4 as uuid_v4} from "uuid";
import {ChoiceDTO, GameboardDTO} from "../../../../IsaacApiTypes";

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
                question: "Having read the feedback, how do you rate your confidence in answering this question again?",
                options: [
                    {label: "Low", color: siteSpecific("negative", "negative-answer")},
                    {label: "Medium", color: siteSpecific("neutral", "neutral-answer")},
                    {label: "High", color: siteSpecific("positive", "positive-answer")}
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
    disableInitialState?: boolean;
    confidenceSessionUuid: React.MutableRefObject<string>;
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

export const ConfidenceQuestions = ({state, setState, confidenceSessionUuid, disableInitialState, identifier, type, correct, answer}: ConfidenceQuestionsProps) => {
    const dispatch = useDispatch();

    const toggle = (confidence: string, state: ActiveConfidenceState) => {
        const stateAndType: `${ActiveConfidenceState} & ${ConfidenceType}` = `${state} & ${type}`;
        switch (stateAndType) {
            case "initial & question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_BEFORE",
                    questionId: identifier,
                    confidenceSessionUuid: confidenceSessionUuid.current,
                    answer,
                    answerCorrect: correct,
                    confidence
                }));
                setState("followUp");
                break;
            case "initial & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_BEFORE",
                    questionId: identifier,
                    confidenceSessionUuid: confidenceSessionUuid.current,
                    confidence
                }));
                setState("followUp");
                break;
            case "followUp & question":
            case "followUp & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_AFTER",
                    questionId: identifier,
                    confidenceSessionUuid: confidenceSessionUuid.current,
                    confidence
                }));
                setState("hidden");
                // Once the user answers the post-question, generate a new session id
                confidenceSessionUuid.current = uuid_v4().slice(0, 8);
                break;
        }
    };

    if (state === "hidden") return null;

    const confidenceVariables = confidenceOptions[type];
    const confidenceStateVariables = confidenceVariables?.states[state];

    const disabled = state === "initial" && disableInitialState === true;

    return <div className={classNames("quick-question-options", {"quick-question-secondary": isCS && state === "followUp", "pb-lg-3 pb-2 pt-lg-4 pt-3 px-lg-4 px-3": isPhy, "p-3": isCS, "quick-question-muted": disabled})}>
        {state === "initial" && <Row>
            <Col md="9">
                <h4 className={classNames({"text-muted": disabled && isCS})}>{confidenceVariables?.title}</h4>
            </Col>
            <Col md="auto" className="ml-auto text-center not-mobile">
                <Button outline color="primary" className={classNames("confidence-help", {"border-muted": disabled && isCS})} size="sm"
                        onClick={() => dispatch(confidenceInformationModal())}>
                    <i className={classNames({"text-muted": disabled && isCS})}>i</i>
                </Button>
            </Col>
        </Row>}
        <Row className="mb-3">
            <Col className={classNames({"text-muted": disabled && isCS})}>
                {confidenceStateVariables.question}
            </Col>
        </Row>
        <Row className={"justify-content-center"}>
            {confidenceStateVariables.options.map(option => <Col lg={4} md={6} sm={12} className={classNames("mb-2")}>
                <Button color={option.color} disabled={disabled} block
                        className={classNames({"active": state === "followUp"})} type="submit"
                        onClick={() => toggle(option.label, state)}>
                    {option.label}
                </Button>
            </Col>)}
        </Row>
    </div>;
};

// This and ConfidenceQuestions should be used together, with the values managed by this hook passed to an instance of
// ConfidenceQuestions. This hook just abstracts away confidence-question-specific stuff so it is easy to remove and
// doesn't have to hang around in IsaacQuestion and IsaacQuickQuestion.
export const useConfidenceQuestionsValues = (show: boolean | undefined, type: ConfidenceType, onConfidenceStateChange?: (cs: ConfidenceState) => void, currentAttempt?: ChoiceDTO, canSubmit?: boolean, correct?: boolean, currentGameboard?: GameboardDTO | null) => {
    // Confidence question specific things
    const [confidenceState, setConfidenceState] = useState<ConfidenceState>("initial");
    const confidenceSessionUuid = useRef(uuid_v4().slice(0, 8));
    const confidenceDisabled = type === "question" && (!canSubmit || !currentAttempt || !currentAttempt.value);
    const showQuestionFeedback = confidenceState !== "initial" || !show || correct;

    // Reset question confidence on attempt change
    useEffect(() => {
        if (type === "question") {
            // If user had answered the question, but is now changing their answer, then generate a new session id
            if (confidenceState === "followUp") {
                confidenceSessionUuid.current = uuid_v4().slice(0, 8);
            }
            setConfidenceState("initial");
        }
    }, [currentAttempt]);

    useEffect(() => {
        onConfidenceStateChange && onConfidenceStateChange(confidenceState);
    }, [confidenceState]);

    return {
        showConfidence: show ?? false,
        confidenceState,
        confidenceDisabled,
        setConfidenceState,
        showQuestionFeedback,
        confidenceSessionUuid: show ? confidenceSessionUuid : undefined,
    };
}