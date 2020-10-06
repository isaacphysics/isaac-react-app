import React, {useContext, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacContent} from "./IsaacContent";
import * as ApiTypes from "../../../IsaacApiTypes";
import {selectors} from "../../state/selectors";
import * as RS from "reactstrap";
import {QUESTION_TYPES, selectQuestionPart} from "../../services/questions";
import {DateString, TIME_ONLY} from "../elements/DateString";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {DOCUMENT_TYPE, NOT_FOUND} from "../../services/constants";
import {RouteComponentProps, withRouter} from "react-router";
import {useCurrentExamBoard} from "../../services/examBoard";
import {determineFastTrackPrimaryAction, determineFastTrackSecondaryAction} from "../../services/fastTrack";
import queryString from "query-string";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";
import {AppState} from "../../state/reducers";

export const IsaacQuestion = withRouter(({doc, location}: {doc: ApiTypes.IsaacQuestionBaseDTO} & RouteComponentProps) => {
    const {board, questionHistory: questionHistoryUrl}: {board?: string; questionHistory?: string} = queryString.parse(location.search);
    const questionHistory = questionHistoryUrl?.split(",") || [];

    const dispatch = useDispatch();
    const page = useSelector((state: AppState) => state?.doc && state.doc !== NOT_FOUND ? state.doc : undefined);
    const pageCompleted = useSelector((state: AppState) => state?.questions ? state.questions.pageCompleted : false);
    const pageQuestions = useSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, doc.id);
    const validationResponse = questionPart?.validationResponse;
    const currentAttempt = questionPart?.currentAttempt;
    const correct = validationResponse?.correct || false;
    const locked = questionPart?.locked;
    const canSubmit = questionPart?.canSubmit && !locked || false;
    const accordion = useContext(AccordionSectionContext);
    const examBoard = useCurrentExamBoard();
    const sigFigsError = (validationResponse?.explanation?.tags || []).includes("sig_figs");

    // Register Question Part in Redux
    useEffect((): (() => void) => {
        dispatch(registerQuestion(doc, accordion.clientId));
        return () => dispatch(deregisterQuestion(doc.id as string));
    }, [dispatch, doc.id]);

    function submitCurrentAttempt(event: React.FormEvent) {
        if (event) {event.preventDefault();}
        if (currentAttempt) {
            dispatch(attemptQuestion(doc.id as string, currentAttempt));
        }
    }

    // Select QuestionComponent from the question part's document type (or default)
    const QuestionComponent = QUESTION_TYPES.get(doc.type || "default");

    // FastTrack
    const isFastTrack = page?.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION || false;
    const fastTrackInfo = {doc, correct, page, pageCompleted, questionHistory, board, examBoard, canSubmit}

    // Determine Action Buttons
    const primaryAction = isFastTrack ? determineFastTrackPrimaryAction(fastTrackInfo) : {
        disabled: !canSubmit,
        value: "Check my answer",
        type: "submit"
    };
    const secondaryAction = isFastTrack ? determineFastTrackSecondaryAction(fastTrackInfo) : null;

    return <RS.Form onSubmit={submitCurrentAttempt}>
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
                    <IsaacContent doc={validationResponse.explanation} />
                </div>}
            </div>}

            {/* Lock */}
            {locked && <RS.Alert color="danger">
                This question is locked until at least {<DateString formatter={TIME_ONLY}>{locked}</DateString>} to prevent repeated guessing.
            </RS.Alert>}

            {/* Action Buttons */}
            {(!correct || canSubmit || (isFastTrack && (primaryAction || secondaryAction))) && !locked &&
                <div className={`d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row ${correct ? "mt-5 mb-n3" : ""}`}>
                    {secondaryAction &&
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ${primaryAction ? "pr-sm-2 pr-md-0 pr-lg-3" : ""}`}>
                            <input {...secondaryAction} className="h-100 btn btn-outline-primary btn-block" />
                        </div>
                    }
                    {primaryAction &&
                        <div className={`m-auto pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ${secondaryAction ? "pl-sm-2 pl-md-0 pl-lg-3" : ""}`}>
                            <input {...primaryAction} className="h-100 btn btn-secondary btn-block" />
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
