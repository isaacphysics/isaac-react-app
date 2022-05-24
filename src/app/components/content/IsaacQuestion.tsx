import React, {useContext, useEffect, useRef, useState} from "react";
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
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {isLoggedIn} from "../../services/user";
import {fastTrackProgressEnabledBoards} from "../../services/constants";
import {ConfidenceQuestions} from "../elements/inputs/QuestionConfidence";
import uuid from "uuid";

export const IsaacQuestion = withRouter(({doc, location}: {doc: ApiTypes.QuestionDTO} & RouteComponentProps) => {
    const dispatch = useDispatch();
    const accordion = useContext(AccordionSectionContext);
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const currentGameboard = useSelector(selectors.board.currentGameboard);
    const currentUser = useSelector(selectors.user.orNull);
    const questionPart = selectQuestionPart(pageQuestions, doc.id);
    const validationResponse = questionPart?.validationResponse;
    const correct = validationResponse?.correct || false;
    const locked = questionPart?.locked;
    const canSubmit = questionPart?.canSubmit && !locked || false;
    const sigFigsError = (validationResponse?.explanation?.tags || []).includes("sig_figs") && SITE_SUBJECT === SITE.PHY;
    const tooManySigFigsError = sigFigsError && (validationResponse?.explanation?.tags || []).includes("sig_figs_too_many");
    const tooFewSigFigsError = sigFigsError && (validationResponse?.explanation?.tags || []).includes("sig_figs_too_few");
    const fastTrackInfo = useFastTrackInformation(doc, location, canSubmit, correct);
    const [isVisible, setVisible] = useState(false);
    const [hideOptions, setHideOptions] = useState(false);
    const attemptUuid = useRef(uuid.v4().slice(0, 8));

    const tooManySigFigsFeedback = <p>
        Whether your answer is correct or not, it has the wrong number of&nbsp;
        <strong><a target='_blank' href='/solving_problems#acc_solving_problems_sig_figs'> significant figures</a></strong>.
    </p>;

    const tooFewSigFigsFeedback = <p>
        We can&apos;t mark this until you provide more&nbsp;
        <strong><a target='_blank' href='/solving_problems#acc_solving_problems_sig_figs'> significant figures</a></strong>.
    </p>;

    // Register Question Part in Redux
    useEffect((): (() => void) => {
        dispatch(registerQuestion(doc, accordion.clientId));
        return () => dispatch(deregisterQuestion(doc.id as string));
    }, [dispatch, doc.id]);

    // Select QuestionComponent from the question part's document type (or default)
    const QuestionComponent = QUESTION_TYPES.get(doc.type || "default");

    // FastTrack buttons should only show up if on a FastTrack-enabled board
    const isFastTrack = fastTrackInfo.isFastTrackPage && currentGameboard?.id && fastTrackProgressEnabledBoards.includes(currentGameboard.id);

    // Determine Action Buttons
    const primaryAction = isFastTrack ?
        determineFastTrackPrimaryAction(fastTrackInfo) :
        {disabled: !canSubmit, value: "Check my answer", type: "submit"};

    const secondaryAction = isFastTrack ?
        determineFastTrackSecondaryAction(fastTrackInfo) :
        null;

    return <RS.Form onSubmit={function submitCurrentAttempt(event) {
        if (event) {event.preventDefault();}
        if (questionPart?.currentAttempt) {
            dispatch(attemptQuestion(doc.id as string, questionPart?.currentAttempt));
            if (isLoggedIn(currentUser) && currentGameboard?.id && !currentGameboard.savedToCurrentUser) {
                dispatch(addGameboard(currentGameboard.id, currentUser));
            }
        }
    }}>
        <div className={`question-component p-md-5 ${doc.type} ${doc.type === 'isaacParsonsQuestion' ? "parsons-layout" : ""}`}>
            {/* @ts-ignore as TypeScript is struggling to infer common type for questions */}
            <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} />

            {/* CS Hints */}
            {SITE_SUBJECT === SITE.CS && <React.Fragment>
                <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />
            </React.Fragment>}

            {/* Validation Response */}
            {validationResponse && !canSubmit && <div className={`validation-response-panel p-3 mt-3 ${correct ? "correct" : ""}`}>
                <div className="pb-1">
                    <h1 className="m-0">{sigFigsError ? "Significant Figures" : correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                {validationResponse.explanation && <div className="mb-2">
                    {tooManySigFigsError ? tooManySigFigsFeedback : tooFewSigFigsError ? tooFewSigFigsFeedback :
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
                <div className={`d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row ${correct ? "mt-5 mb-n3" : ""}`}>
                    {secondaryAction &&
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ${primaryAction ? "pr-sm-2 pr-md-0 pr-lg-3" : ""}`}>
                            <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block" />
                        </div>
                    }
                    {primaryAction &&
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-100 w-md-100 w-lg-100 ${secondaryAction ? "pl-sm-2 pl-md-0 pl-lg-3" : ""}`}>
                            {hideOptions && <input {...primaryAction} className="h-100 btn btn-secondary btn-block" />}
                            {ConfidenceQuestions({hideOptions: hideOptions, setHideOptions: setHideOptions, isVisible: isVisible, setVisible: setVisible, identifier: doc.id, attemptUuid: attemptUuid, type: "question", correct: correct, answer: questionPart?.currentAttempt})}
                        </div>
                    }
                </div>
            }

            {/* CS Hint Reminder */}
            {SITE_SUBJECT === SITE.CS && (!validationResponse || !correct || canSubmit) && <RS.Row>
                <RS.Col xl={{size: 10, offset: 1}} >
                    {doc.hints && <p className="no-print text-center pt-2 mb-0">
                        <small>{"Don't forget to use the hints above if you need help."}</small>
                    </p>}
                </RS.Col>
            </RS.Row>}

            {/* Physics Hints */}
            {SITE_SUBJECT === SITE.PHY && <div className={correct ? "mt-5" : ""}>
                <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints}/>
            </div>}
        </div>
    </RS.Form>;
});
