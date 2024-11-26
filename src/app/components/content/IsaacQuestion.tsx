import React, {Suspense, useContext, useEffect, useRef, useState} from "react";
import {
    deregisterQuestions,
    registerQuestions,
    selectors,
    useAppDispatch,
    useAppSelector,
    useCanAttemptQuestionTypeQuery
} from "../../state";
import {IsaacContent} from "./IsaacContent";
import * as ApiTypes from "../../../IsaacApiTypes";
import {ContentDTO} from "../../../IsaacApiTypes";
import {
    below,
    determineFastTrackPrimaryAction,
    determineFastTrackSecondaryAction,
    fastTrackProgressEnabledBoards,
    isAda,
    isPhy,
    QUESTION_TYPES,
    RESTRICTED_QUESTION_TYPES,
    selectQuestionPart,
    submitCurrentAttempt,
    useDeviceSize,
    useFastTrackInformation} from "../../services";
import {DateString, TIME_ONLY} from "../elements/DateString";
import {AccordionSectionContext, ConfidenceContext, GameboardContext, InlineQuestionDTO, InlineContext} from "../../../IsaacAppTypes";
import {RouteComponentProps, withRouter} from "react-router";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {ConfidenceQuestions, useConfidenceQuestionsValues} from "../elements/inputs/ConfidenceQuestions";
import {Loading} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import { submitInlineRegion, useInlineRegionPart } from "./IsaacInlineRegion";
import LLMFreeTextQuestionFeedbackView from "../elements/LLMFreeTextQuestionFeedbackView";
import { LLMFreeTextQuestionRemainingAttemptsView } from "../elements/LLMFreeTextQuestionRemainingAttemptsView";
import { skipToken } from "@reduxjs/toolkit/query";
import { Alert, Button, Col, Form, Row } from "reactstrap";

function useCanAttemptQuestionType(questionType?: string): ReturnType<typeof useCanAttemptQuestionTypeQuery> {
    // We skip the check with the API if the question type is not a restricted question type
    const canAttemptRestrictedQuestionType =
        useCanAttemptQuestionTypeQuery(questionType && RESTRICTED_QUESTION_TYPES.includes(questionType) ? questionType : skipToken);
    // non-restricted question types are always allowed
    if (questionType && !RESTRICTED_QUESTION_TYPES.includes(questionType)) {
        return { ...canAttemptRestrictedQuestionType, isSuccess: true };
    } else {
        return canAttemptRestrictedQuestionType;
    }
}

export const IsaacQuestion = withRouter(({doc, location}: {doc: ApiTypes.QuestionDTO} & RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const accordion = useContext(AccordionSectionContext);
    const currentGameboard = useContext(GameboardContext);
    const inlineContext = useContext(InlineContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const currentUser = useAppSelector(selectors.user.orNull);
    const questionPart = (doc.type === "isaacInlineRegion") ? useInlineRegionPart(pageQuestions) : selectQuestionPart(pageQuestions, doc.id);
    const canAttemptQuestionType = useCanAttemptQuestionType(doc.type);
    const currentAttempt = questionPart?.currentAttempt;
    const validationResponse = questionPart?.validationResponse;
    const validationResponseTags = validationResponse?.explanation?.tags;
    const correct = validationResponse?.correct || false;
    const locked = questionPart?.locked;
    const hasValue = (currentAttempt?.type === "quantity") ? (currentAttempt.value != null && currentAttempt.value != "") : true;
    const canSubmit = hasValue && canAttemptQuestionType.isSuccess && questionPart?.canSubmit && !locked || false;
    const sigFigsError = isPhy && validationResponseTags?.includes("sig_figs");
    const tooManySigFigsError = sigFigsError && validationResponseTags?.includes("sig_figs_too_many");
    const tooFewSigFigsError = sigFigsError && validationResponseTags?.includes("sig_figs_too_few");
    const invalidFormatError = validationResponseTags?.includes("unrecognised_format");
    const invalidFormatErrorStdForm = validationResponseTags?.includes("invalid_std_form");
    const fastTrackInfo = useFastTrackInformation(doc, location, canSubmit, correct);
    const deviceSize = useDeviceSize();
    const feedbackRef = useRef<HTMLDivElement>(null);
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const hidingAttempts = useAppSelector(selectors.user.preferences)?.DISPLAY_SETTING?.HIDE_QUESTION_ATTEMPTS ?? false;


    const {confidenceState, setConfidenceState, validationPending, setValidationPending, confidenceDisabled, recordConfidence, showQuestionFeedback} = useConfidenceQuestionsValues(
        currentGameboard?.tags?.includes("CONFIDENCE_RESEARCH_BOARD"),
        "question",
        undefined,
        currentAttempt,
        canSubmit,
        correct,
        !!locked
    );

    const tooManySigFigsFeedback = <p>
        Whether your answer is correct or not, it has the wrong number of&nbsp;
        <strong><a target='_blank' href='/solving_problems#acc_solving_problems_sig_figs'> significant figures</a></strong>.
    </p>;

    const tooFewSigFigsFeedback = <p>
        We can&apos;t mark this until you provide more&nbsp;
        <strong><a target='_blank' href='/solving_problems#acc_solving_problems_sig_figs'> significant figures</a></strong>.
    </p>;

    const invalidFormatFeeback = <p>
        Your answer is not in a format we recognise, please enter your answer as a decimal number.<br/>
        {invalidFormatErrorStdForm && <>When writing standard form, you must include <code>^</code> or <code>**</code> between the 10 and the exponent.<br/></>}
        {isPhy && <>For help, see our <a target="_blank" href="/solving_problems#units">guide to answering numeric questions</a>.</>}
    </p>;

    // Register Question Part in Redux
    useEffect(() => {
        if (doc.type === "isaacInlineRegion") {
            // register the inline questions inside this region (but not the region itself).
            // note that this must happen after the inline entry spans have been created, and on soft link navigation this is not guaranteed by the
            // portals rendering order; as such, this hook is also dependent on inlineContext.initialised, which updates strictly after span creation.
            const inlineQuestions = (doc as ApiTypes.IsaacInlineRegionDTO).inlineQuestions ?? [];
            dispatch(registerQuestions(inlineQuestions, accordion.clientId));
            return () => dispatch(deregisterQuestions(inlineQuestions.map(q => q.id as string)));
        }
        dispatch(registerQuestions([doc], accordion.clientId));
        return () => dispatch(deregisterQuestions([doc.id as string]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, doc.id, inlineContext?.initialised]);

    // Focus on the feedback banner after submission
    useEffect(() => {
        if (hasSubmitted) {
            feedbackRef.current?.focus();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validationResponse]);

    // Select QuestionComponent from the question part's document type (or default)
    const QuestionComponent = QUESTION_TYPES[doc?.type ?? "default"];

    // FastTrack buttons should only show up if on a FastTrack-enabled board
    const isFastTrack = fastTrackInfo.isFastTrackPage && currentGameboard?.id && fastTrackProgressEnabledBoards.includes(currentGameboard.id);

    // Free text question
    const isLLMFreeTextQuestion = doc.type === "isaacLLMFreeTextQuestion";
    const [sentFeedback, setSentFeedback] = useState(false);
    const awaitingFeedback = isLLMFreeTextQuestion && hasSubmitted && validationResponse && !sentFeedback;

    // Inline questions
    const isInlineQuestion = doc.type === "isaacInlineRegion" && inlineContext;

    const numInlineQuestions = isInlineQuestion ? Object.values(inlineContext?.elementToQuestionMap ?? {}).length : undefined;
    const numCorrectInlineQuestions = (isInlineQuestion && validationResponse) ? (questionPart as InlineQuestionDTO).validationResponse?.partsCorrect : undefined;
    const showInlineAttemptStatus = !isInlineQuestion || !inlineContext?.isModifiedSinceLastSubmission;

    const almost = !correct && (
        (numCorrectInlineQuestions && numCorrectInlineQuestions > 0) ||                                                   // inline
        (doc.type === "isaacClozeQuestion" && [true, false].every(
            b => (validationResponse as ApiTypes.ItemValidationResponseDTO)?.itemsCorrect?.includes(b))                   // cloze (detailedFeedback only)
        )
    );

    // Determine Action Buttons
    const isLongRunningQuestionType = isLLMFreeTextQuestion;
    const submitButtonLabel = isLongRunningQuestionType && questionPart?.loading ? "Marking your answer…" : "Check my answer";
    const primaryAction = isFastTrack 
        ? determineFastTrackPrimaryAction(fastTrackInfo) 
        : isInlineQuestion 
            ? {disabled: !canSubmit, value: submitButtonLabel, type: "submit", onClick: () => { 
                submitInlineRegion(inlineContext, currentGameboard, currentUser, pageQuestions, dispatch, hidingAttempts);
            }} 
            : {disabled: !canSubmit || awaitingFeedback, value: submitButtonLabel, type: "submit"};

    const secondaryAction = isFastTrack ?
        determineFastTrackSecondaryAction(fastTrackInfo) :
        null;

    const validationFeedback = invalidFormatError ? invalidFormatFeeback : tooManySigFigsError ? tooManySigFigsFeedback : tooFewSigFigsError ? tooFewSigFigsFeedback :
        <IsaacContent doc={validationResponse?.explanation as ContentDTO}/>;

    return <ConfidenceContext.Provider value={{recordConfidence}}>
        <Form onSubmit={(event) => {
            if (event) {event.preventDefault();}
            submitCurrentAttempt(questionPart, doc.id as string, doc.type as string, currentGameboard, currentUser, dispatch);
            setHasSubmitted(true);
            setSentFeedback(false);
        }}>
            <div className={
                classNames(
                    "question-component p-md-5",
                    doc.type,
                    {"expansion-layout": ["isaacParsonsQuestion", "isaacReorderQuestion"].includes(doc.type as string)}
                )}>
                
                {isLLMFreeTextQuestion && <LLMFreeTextQuestionRemainingAttemptsView canAttemptQuestionType={canAttemptQuestionType} />}

                <Suspense fallback={<Loading/>}>
                    <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} readonly={awaitingFeedback} />
                </Suspense>

                {isAda &&
                    <div className="mt-4">
                        <hr className="border-silver-grey" />
                    </div>
                }

                {/* CS Hint Reminder */}
                {isAda && (!validationResponse || !correct || canSubmit) && <Row>
                    <Col xl={{size: 10}} >
                        {doc.hints && !!doc.hints.length && <p className="no-print mb-0">
                            <small>{"Don't forget to use the hints if you need help."}</small>
                        </p>}
                    </Col>
                </Row>}

                {/* CS Hints */}
                {isAda && <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />}

                {/* Validation Response */}
                {showQuestionFeedback && validationResponse && showInlineAttemptStatus && !canSubmit && !isLLMFreeTextQuestion && <div
                    className={`validation-response-panel p-3 mt-3 ${correct ? "correct" : almost ? "almost" : ""}`}
                >
                    <div tabIndex={-1} className="pb-1" ref={feedbackRef}>
                        {
                            <h1 className="m-0">
                                {correct ? "Correct!" : (
                                    sigFigsError ? "Significant Figures" : (
                                        almost ? "Partly correct..." : "Incorrect"
                                    )
                                )}
                            </h1>
                        }
                    </div>
                    {validationResponse.explanation && <div className="mb-2">
                        {isInlineQuestion && numInlineQuestions && numInlineQuestions > 1 ? <>
                            <span>You can view feedback for a specific box by either selecting it above, or by using the control panel below.</span>
                            <div className={`feedback-panel-${almost ? "light" : "dark"}`} role="note" aria-labelledby="answer-feedback">
                                <div className={`w-100 mt-2 d-flex feedback-panel-header justify-content-around`}>
                                    <Button color="transparent" onClick={() => {
                                        inlineContext.setFeedbackIndex(((inlineContext?.feedbackIndex as number - 1) + numInlineQuestions) % numInlineQuestions);
                                    }}>
                                        {below["xs"](deviceSize) ? "◀" : "Previous" }
                                    </Button>
                                    <Button color="transparent" className="inline-part-jump align-self-center" onClick={() => {
                                        if (inlineContext.feedbackIndex) inlineContext.setFocusSelection(true);
                                    }}>
                                        Box {inlineContext.feedbackIndex as number + 1} of {numInlineQuestions}
                                    </Button>
                                    <Button color="transparent" onClick={() => {
                                        inlineContext.setFeedbackIndex((inlineContext?.feedbackIndex as number + 1) % numInlineQuestions);
                                    }}>
                                        {below["xs"](deviceSize) ? "▶" : "Next"}
                                    </Button>
                                </div>
                                <div className="feedback-panel-content p-3">
                                    {validationFeedback}
                                </div>
                            </div>
                        </> : validationFeedback}
                    </div>}
                </div>}

                {/* Lock */}
                {locked && <Alert color="danger" className={"no-print"}>
                    This question is locked until at least {<DateString formatter={TIME_ONLY}>{locked}</DateString>} to prevent repeated guessing.
                </Alert>}

                {/* Action Buttons */}
                {recordConfidence ?
                    <ConfidenceQuestions state={confidenceState} setState={setConfidenceState}
                        validationPending={validationPending} setValidationPending={setValidationPending}
                        disableInitialState={confidenceDisabled}
                        identifier={doc.id} type={"question"}
                        validationResponse={validationResponse} />
                    :
                    (!correct || canSubmit || (fastTrackInfo.isFastTrackPage && (primaryAction || secondaryAction))) && !locked &&
                        <div
                            className={classNames("d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row", {"mt-5 mb-n3": correct})}>
                            {secondaryAction &&
                            <div
                                className={classNames("m-auto pt-3 pb-1 w-100 w-sm-100 w-md-50 w-lg-50", {"pe-sm-2 pe-md-0 pe-lg-3": primaryAction})}>
                                <input {...secondaryAction} className="h-100 btn btn-outline-primary w-100"/>
                            </div>
                            }
                            {primaryAction &&
                            <div
                                className={classNames("m-auto pt-3 pb-1 w-100 w-sm-100 w-md-50 w-lg-50", {"ps-sm-2 ps-md-0 ps-lg-3": secondaryAction})}>
                                <input {...primaryAction} className="h-100 btn btn-secondary w-100"/>
                            </div>
                            }
                        </div>
                }

                {/* Physics Hints */}
                {isPhy && <div className={correct ? "mt-5" : ""}>
                    <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints} />
                </div>}
            </div>
        </Form>

        {/* LLM free-text question validation response */}
        {isLLMFreeTextQuestion && showQuestionFeedback && validationResponse && showInlineAttemptStatus && !canSubmit &&
            <LLMFreeTextQuestionFeedbackView {...{validationResponse, hasSubmitted, sentFeedback, setSentFeedback}} />
        }
    </ConfidenceContext.Provider>;
});
