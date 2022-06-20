import React, {useContext, useEffect, Suspense, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {addGameboard, attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacContent} from "./IsaacContent";
import * as ApiTypes from "../../../IsaacApiTypes";
import {selectors} from "../../state/selectors";
import * as RS from "reactstrap";
import {QUESTION_TYPES, selectQuestionPart} from "../../services/questions";
import {DateString, TIME_ONLY} from "../elements/DateString";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {RouteComponentProps, withRouter} from "react-router";
import {
    determineFastTrackPrimaryAction,
    determineFastTrackSecondaryAction,
    useFastTrackInformation
} from "../../services/fastTrack";
import {isCS, isPhy} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {isLoggedIn} from "../../services/user";
import {fastTrackProgressEnabledBoards} from "../../services/constants";
import {ConfidenceQuestions, ConfidenceState} from "../elements/inputs/ConfidenceQuestions";
import {Loading} from "../handlers/IsaacSpinner";
import classNames from "classnames";
import {v4 as uuid_v4} from "uuid";

export const IsaacQuestion = withRouter(({doc, location}: {doc: ApiTypes.QuestionDTO} & RouteComponentProps) => {
    const dispatch = useDispatch();
    const accordion = useContext(AccordionSectionContext);
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const currentGameboard = useSelector(selectors.board.currentGameboard);
    const currentUser = useSelector(selectors.user.orNull);
    const questionPart = selectQuestionPart(pageQuestions, doc.id);
    const currentAttempt = questionPart?.currentAttempt;
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
        dispatch(registerQuestion(doc, accordion.clientId));
        return () => { dispatch(deregisterQuestion(doc.id as string)); }
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

    // Confidence question specific things
    const [confidenceState, setConfidenceState] = useState<ConfidenceState>("initial");
    const showConfidence = isCS; // && doc.showConfidence or some other condition TODO!
    const confidenceSessionUuid = useRef(uuid_v4().slice(0, 8));

    // Reset question confidence on attempt change
    useEffect(() => {
        setConfidenceState("initial");
    }, [currentAttempt]);

    return <RS.Form onSubmit={function submitCurrentAttempt(event) {
        if (event) {event.preventDefault();}
        if (questionPart?.currentAttempt) {
            dispatch(attemptQuestion(doc.id as string, questionPart?.currentAttempt));
            if (isLoggedIn(currentUser) && currentGameboard?.id && !currentGameboard.savedToCurrentUser) {
                dispatch(addGameboard(currentGameboard.id, currentUser));
            }
        }
    }}>
        <div className={classNames("question-component p-md-5", doc.type, {"parsons-layout": ["isaacParsonsQuestion", "isaacReorderQuestion"].includes(doc.type as string)})}>
            <Suspense fallback={<Loading/>}>
                <QuestionComponent questionId={doc.id as string} doc={doc} {...{validationResponse}} />
            </Suspense>

            {/* CS Hints */}
            {isCS && <React.Fragment>
                <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />
            </React.Fragment>}

            {/* Validation Response */}
            {(confidenceState !== "initial" || !showConfidence) && validationResponse && !canSubmit && <div className={`validation-response-panel p-3 mt-3 ${correct ? "correct" : ""}`}>
                <div className="pb-1">
                    <h1 className="m-0">{sigFigsError ? "Significant Figures" : correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                {validationResponse.explanation && <div className="mb-2">
                    {invalidFormatError ? invalidFormatFeeback : tooManySigFigsError ? tooManySigFigsFeedback : tooFewSigFigsError ? tooFewSigFigsFeedback :
                        <IsaacContent doc={validationResponse.explanation}/>
                    }
                </div>}
            </div>}

            {/* Lock */}
            {locked && <RS.Alert color="danger" className={"no-print"}>
                This question is locked until at least {<DateString formatter={TIME_ONLY}>{locked}</DateString>} to prevent repeated guessing.
            </RS.Alert>}

            {/* Action Buttons */}
            {(!correct || canSubmit || (fastTrackInfo.isFastTrackPage && (primaryAction || secondaryAction))) && !locked &&
                <div className={classNames("d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row", {"mt-5 mb-n3": correct})}>
                    {secondaryAction &&
                        <div className={classNames("m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50", {"pr-sm-2 pr-md-0 pr-lg-3": primaryAction})}>
                            <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block" />
                        </div>
                    }
                    {primaryAction &&
                        <div className={classNames("m-auto pt-3 pb-1 w-100 w-sm-100 w-md-100 w-lg-100", {"pl-sm-2 pl-md-0 pl-lg-3": secondaryAction})}>
                            {showConfidence ?
                                <ConfidenceQuestions state={confidenceState} setState={setConfidenceState} disableInitialState={!canSubmit}
                                                     identifier={doc.id} confidenceSessionUuid={confidenceSessionUuid} type={"question"}
                                                     correct={correct} answer={questionPart?.currentAttempt} />
                                : <input {...primaryAction} className="h-100 btn btn-secondary btn-block" />
                            }
                        </div>
                    }
                </div>
            }

            {/* CS Hint Reminder */}
            {isCS && (!validationResponse || !correct || canSubmit) && <RS.Row>
                <RS.Col xl={{size: 10, offset: 1}} >
                    {doc.hints && <p className="no-print text-center pt-2 mb-0">
                        <small>{"Don't forget to use the hints above if you need help."}</small>
                    </p>}
                </RS.Col>
            </RS.Row>}

            {/* Physics Hints */}
            {isPhy && <div className={correct ? "mt-5" : ""}>
                <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints}/>
            </div>}
        </div>
    </RS.Form>;
});
