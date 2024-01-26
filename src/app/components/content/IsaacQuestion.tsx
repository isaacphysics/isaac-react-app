import React, {Suspense, useContext, useEffect} from "react";
import {
    attemptQuestion,
    deregisterQuestions,
    registerQuestions,
    saveGameboard,
    selectors,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {IsaacContent} from "./IsaacContent";
import * as ApiTypes from "../../../IsaacApiTypes";
import {BEST_ATTEMPT_HIDDEN, ContentDTO} from "../../../IsaacApiTypes";
import * as RS from "reactstrap";
import {
    determineFastTrackPrimaryAction,
    determineFastTrackSecondaryAction,
    fastTrackProgressEnabledBoards,
    isAda,
    isLoggedIn,
    isPhy,
    KEY,
    persistence,
    QUESTION_TYPES,
    selectQuestionPart,
    trackEvent,
    useFastTrackInformation,
    wasTodayUTC
} from "../../services";
import {DateString, TIME_ONLY} from "../elements/DateString";
import {AccordionSectionContext, ConfidenceContext, GameboardContext} from "../../../IsaacAppTypes";
import {RouteComponentProps, withRouter} from "react-router";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {ConfidenceQuestions, useConfidenceQuestionsValues} from "../elements/inputs/ConfidenceQuestions";
import {Loading} from "../handlers/IsaacSpinner";
import classNames from "classnames";

export const IsaacQuestion = withRouter(({doc, location}: {doc: ApiTypes.QuestionDTO} & RouteComponentProps) => {
    const dispatch = useAppDispatch();
    const accordion = useContext(AccordionSectionContext);
    const currentGameboard = useContext(GameboardContext);
    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const currentUser = useAppSelector(selectors.user.orNull);
    const questionPart = selectQuestionPart(pageQuestions, doc.id);
    const currentAttempt = questionPart?.currentAttempt;
    const bestAttempt = questionPart?.bestAttempt;
    const validationResponse = questionPart?.validationResponse;
    const validationResponseTags = validationResponse?.explanation?.tags;
    const correct = validationResponse?.correct || false;
    const locked = questionPart?.locked;
    const canSubmit = questionPart?.canSubmit && !locked || false;
    const sigFigsError = isPhy && validationResponseTags?.includes("sig_figs");
    const tooManySigFigsError = sigFigsError && validationResponseTags?.includes("sig_figs_too_many");
    const tooFewSigFigsError = sigFigsError && validationResponseTags?.includes("sig_figs_too_few");
    const invalidFormatError = validationResponseTags?.includes("unrecognised_format");
    const invalidFormatErrorStdForm = validationResponseTags?.includes("invalid_std_form");
    const fastTrackInfo = useFastTrackInformation(doc, location, canSubmit, correct);

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
        {isPhy && <>For help, see our <a target="_blank" href="/solving_problems#units">guide to answering numeric questions</a></>}.
    </p>;

    // Register Question Part in Redux
    useEffect(() => {
        dispatch(registerQuestions([doc], accordion.clientId));
        return () => dispatch(deregisterQuestions([doc.id as string]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, doc.id]);

    // Select QuestionComponent from the question part's document type (or default)
    const QuestionComponent = QUESTION_TYPES[doc?.type ?? "default"];

    // FastTrack buttons should only show up if on a FastTrack-enabled board
    const isFastTrack = fastTrackInfo.isFastTrackPage && currentGameboard?.id && fastTrackProgressEnabledBoards.includes(currentGameboard.id);

    // Determine Action Buttons
    const primaryAction = isFastTrack ?
        determineFastTrackPrimaryAction(fastTrackInfo) :
        {disabled: !canSubmit, value: "Check my answer", type: "submit"};

    const secondaryAction = isFastTrack ?
        determineFastTrackSecondaryAction(fastTrackInfo) :
        null;

    return <ConfidenceContext.Provider value={{recordConfidence}}>
        <RS.Form onSubmit={function submitCurrentAttempt(event) {
            if (event) {event.preventDefault();}
            if (questionPart?.currentAttempt) {

                // Notify Plausible that at least one question attempt has taken place today
                if (persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME) == null || !wasTodayUTC(persistence.load(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME))) {
                    persistence.save(KEY.INITIAL_DAILY_QUESTION_ATTEMPT_TIME, new Date().toString());
                    trackEvent("question_attempted");
                }

                dispatch(attemptQuestion(doc.id as string, questionPart?.currentAttempt, currentGameboard?.id));
                if (isLoggedIn(currentUser) && currentGameboard?.id && !currentGameboard.savedToCurrentUser) {
                    dispatch(saveGameboard({
                        boardId: currentGameboard.id,
                        user: currentUser,
                        redirectOnSuccess: false
                    }));
                }
            }
        }}>
            <div className={
                classNames(
                    "question-component p-md-5",
                    doc.type,
                    {"expansion-layout": ["isaacParsonsQuestion", "isaacReorderQuestion"].includes(doc.type as string)}
                )}>
                <Suspense fallback={<Loading/>}>
                    <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} />
                </Suspense>

                {!currentAttempt && bestAttempt === BEST_ATTEMPT_HIDDEN && <div className={"w-100 text-center"}>
                    <small className={"no-print text-muted"}>
                        A previous attempt at this question part has been hidden.
                    </small>
                </div>}

                {isAda &&
                    <div className="mt-4">
                        <hr className="border-silver-grey" />
                    </div>
                }

                {/* CS Hint Reminder */}
                {isAda && (!validationResponse || !correct || canSubmit) && <RS.Row>
                    <RS.Col xl={{size: 10}} >
                        {doc.hints && <p className="no-print mb-0">
                            <small>{"Don't forget to use the hints if you need help."}</small>
                        </p>}
                    </RS.Col>
                </RS.Row>}

                {/* CS Hints */}
                {isAda && <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />}

                {/* Validation Response */}
                {showQuestionFeedback && validationResponse && !canSubmit && <div className={`validation-response-panel p-3 mt-3 ${correct ? "correct" : ""}`}>
                    <div className="pb-1">
                        <h1 className="m-0">{sigFigsError ? "Significant Figures" : correct ? "Correct!" : "Incorrect"}</h1>
                    </div>
                    {validationResponse.explanation && <div className="mb-2">
                        {invalidFormatError ? invalidFormatFeeback : tooManySigFigsError ? tooManySigFigsFeedback : tooFewSigFigsError ? tooFewSigFigsFeedback :
                            <IsaacContent doc={validationResponse.explanation as ContentDTO}/>
                        }
                    </div>}
                </div>}

                {/* Lock */}
                {locked && <RS.Alert color="danger" className={"no-print"}>
                    This question is locked until at least {<DateString formatter={TIME_ONLY}>{locked}</DateString>} to prevent repeated guessing.
                </RS.Alert>}

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
                                className={classNames("m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50", {"pr-sm-2 pr-md-0 pr-lg-3": primaryAction})}>
                                <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block"/>
                            </div>
                            }
                            {primaryAction &&
                            <div
                                className={classNames("m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50", {"pl-sm-2 pl-md-0 pl-lg-3": secondaryAction})}>
                                <input {...primaryAction} className="h-100 btn btn-secondary btn-block"/>
                            </div>
                            }
                        </div>
                }

                {/* Physics Hints */}
                {isPhy && <div className={correct ? "mt-5" : ""}>
                    <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints} />
                </div>}
            </div>
        </RS.Form>
    </ConfidenceContext.Provider>;
});
