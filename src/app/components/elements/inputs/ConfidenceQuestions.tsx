import {Button, Col, Row} from "reactstrap";
import React, {useEffect, useState} from "react";
import {closeActiveModal, logAction, openActiveModal, store, useAppDispatch} from "../../../state";
import {ConfidenceType} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import {isAda, isPhy, SITE_TITLE_SHORT} from "../../../services";
import {ChoiceDTO, ItemChoiceDTO, QuestionValidationResponseDTO} from "../../../../IsaacApiTypes";
import {Immutable} from "immer";
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

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
// "color" only applies to Physics.
const confidenceOptions: {[option in ConfidenceType]: ConfidenceVariables} = {
    "question": {
        title: i18next.t('confidence.question.instructions', 'Click a button to check your answer'),
        states: {
            initial: {
                question: i18next.t('confidence.question.initial', 'What is your level of confidence that your answer is correct?'),
                options: [
                    {label: i18next.t('confidence.low', 'Low'), color: "negative"},
                    {label: i18next.t('confidence.medium', 'Medium'), color: "neutral"},
                    {label: i18next.t('confidence.high', 'High'), color: "positive"}
                ]
            },
            followUp: {
                question: i18next.t('confidence.question.followUp', 'Having read the feedback, what is your level of confidence in answering this question correctly now?'),
                options: [
                    {label: i18next.t('confidence.low', 'Low'), color: "negative"},
                    {label: i18next.t('confidence.medium', 'Medium'), color: "neutral"},
                    {label: i18next.t('confidence.high', 'High'), color: "positive"}
                ]
            }
        }
    },
    "quick_question": {
        title: i18next.t('confidence.quick_question.instructions', 'Click a button to show the answer'),
        states: {
            initial: {
                question: i18next.t('confidence.quick_question.initial', 'What is your level of confidence that your own answer is correct?'),
                options: [
                    {label: i18next.t('confidence.low', 'Low'), color: "negative"},
                    {label: i18next.t('confidence.medium', 'Medium'), color: "neutral"},
                    {label: i18next.t('confidence.high', 'High'), color: "positive"}
                ]
            },
            followUp: {
                question: i18next.t('confidence.quick_question.followUp', 'Is your own answer correct?'),
                options: [
                    {label: i18next.t('confidence.no', 'No'), color:"negative"},
                    {label: i18next.t('confidence.partly', 'Partly'), color: "neutral"},
                    {label: i18next.t('confidence.yes', 'Yes'), color: "secondary"}
                ]
            }
        }
    }
};

interface ConfidenceQuestionsProps {
    state: ConfidenceState;
    setState: (cs: ConfidenceState | ((cs: ConfidenceState) => ConfidenceState)) => void;
    validationPending: ValidationPendingState;
    setValidationPending: (vp: ValidationPendingState | ((vp: ValidationPendingState) => ValidationPendingState)) => void;
    identifier: any;
    disableInitialState?: boolean;
    type: ConfidenceType;
    validationResponse?: Immutable<QuestionValidationResponseDTO>,
    answer?: any;
}

const confidenceInformationModal = () => openActiveModal({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t('information', 'Information'),
    body: <div className="mb-4">{i18next.t('weRegularlyReviewAndUpdateTheSite_title_shortPlatformsContentAndWouldLikeYourInputInOrderToPrioritiseContentAndAssessTheImpactOfUpdatesDataCapturedWithTheseButtonsWillHelpUsIdentifyPriorityAreas', 'We regularly review and update the {{SITE_TITLE_SHORT}} platform’s content and would like your input in order to\n        prioritise content and assess the impact of updates. Data captured with these buttons will help us\n        identify priority areas.', { SITE_TITLE_SHORT })}</div>
});

type ValidationPendingState =
  | {
    pending: true,
    confidence: string,
    updateState: boolean
} | {
    pending: false
}

export const ConfidenceQuestions = ({state, setState, validationPending, setValidationPending, disableInitialState, identifier, type, validationResponse}: ConfidenceQuestionsProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const toggle = (confidence: string, state: ActiveConfidenceState) => {
        const stateAndType: `${ActiveConfidenceState} & ${ConfidenceType}` = `${state} & ${type}`;
        switch (stateAndType) {
            case "initial & question":
                setValidationPending({pending: true, updateState: true, confidence});
                break;
            case "initial & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_BEFORE",
                    questionId: identifier,
                    confidence
                }));
                setState("followUp");
                break;
            case "followUp & question":
            case "followUp & quick_question":
                dispatch(logAction({
                    type: "QUESTION_CONFIDENCE_AFTER",
                    questionId: identifier,
                    confidence
                }));
                setState("hidden");
                break;
        }
    };

    useEffect(() => {
        // The validation response gets set to undefined whenever the current attempt changes, so I am very sure
        // that this log action will only run once for a given attempt.
        if (validationResponse && validationPending.pending) {
            dispatch(logAction({
                type: "QUESTION_CONFIDENCE_BEFORE",
                questionId: identifier,
                answer: validationResponse.answer,
                answerCorrect: validationResponse.correct,
                confidence: validationPending.confidence
            }));
            if (validationPending.updateState) setState("followUp");
        }
        if (type === "question") {
            setValidationPending({pending: false});
        }
    }, [validationResponse]);

    if (state === "hidden") return null;

    const confidenceVariables = confidenceOptions[type];
    const confidenceStateVariables = confidenceVariables?.states[state];

    const disabled = state === "initial" && disableInitialState === true;

    return <div className={classNames("quick-question-options no-print", {"quick-question-secondary": isAda && state === "followUp", "pb-lg-3 pb-2 pt-lg-4 pt-3 px-lg-4 px-3": isPhy, "p-3": isAda, "quick-question-muted": disabled && isPhy})}>
        {state === "initial" && <div className={"d-flex"}>
            <h4 className={classNames({"text-muted": disabled && isAda})}>{confidenceVariables?.title}</h4>
            <div className="ms-2 mt-n1 not-mobile">
                <Button outline={isPhy} color="solid" className={"confidence-help"} size="sm"
                    onClick={() => dispatch(confidenceInformationModal())}
                >
                    {
                        isPhy && <i>i</i>
                    }
                </Button>
            </div>
        </div>}
        <Row className="mb-3">
            <Col className={classNames({"text-muted": disabled && isAda})}>
                {confidenceStateVariables.question}
            </Col>
        </Row>
        <Row className={"justify-content-center"}>
            {confidenceStateVariables.options.map(option => <Col key={option.label} xl={4} size={12} className={classNames("mb-2")}>
                <Button color={isAda ? "keyline" : option.color} disabled={disabled} block
                    className={classNames({"active": isPhy && state === "followUp"})} type="submit"
                    onClick={() => toggle(option.label, state)}
                >
                    {option.label}
                </Button>
            </Col>)}
        </Row>
    </div>;
};

// This and ConfidenceQuestions should be used together, with the values managed by this hook passed to an instance of
// ConfidenceQuestions. This hook just abstracts away confidence-question-specific stuff so it is easy to remove and
// doesn't have to hang around in IsaacQuestion and IsaacQuickQuestion.
export const useConfidenceQuestionsValues = (show: boolean | undefined, type: ConfidenceType, onConfidenceStateChange?: (cs: ConfidenceState) => void, currentAttempt?: Immutable<ChoiceDTO>, canSubmit?: boolean, correct?: boolean, locked?: boolean) => {
    // Confidence question specific things
    const [confidenceState, setConfidenceState] = useState<ConfidenceState>("initial");
    const [validationPending, setValidationPending] = useState<ValidationPendingState>({pending: false});
    const confidenceDisabled = type === "question" && (!canSubmit || !currentAttempt || (currentAttempt.value === "") || (Array.isArray((currentAttempt as Immutable<ItemChoiceDTO>).items) && (currentAttempt as Immutable<ItemChoiceDTO>).items?.length === 0));
    const showQuestionFeedback = confidenceState !== "initial" || !show || correct;

    // Reset question confidence on attempt change
    useEffect(() => {
        if (type === "question") {
            setConfidenceState("initial");
            setValidationPending(vp => vp.pending ? {...vp, updateState: false} : vp);
        }
    }, [currentAttempt]);

    useEffect(() => {
        if (type === "question" && (correct || !canSubmit && !locked)) {
            setConfidenceState("hidden");
        }
    }, [correct, canSubmit, locked]);

    useEffect(() => {
        if (onConfidenceStateChange) onConfidenceStateChange(confidenceState);
    }, [confidenceState]);

    return {
        recordConfidence: show ?? false,
        confidenceState,
        validationPending,
        confidenceDisabled,
        setConfidenceState,
        setValidationPending,
        showQuestionFeedback
    };
};
