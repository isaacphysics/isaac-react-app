import React, {useContext, useEffect} from "react";
import {connect, useDispatch} from "react-redux";
import {attemptQuestion, deregisterQuestion, registerQuestion} from "../../state/actions";
import {IsaacContent} from "./IsaacContent";
import {AppState} from "../../state/reducers";
import * as ApiTypes from "../../../IsaacApiTypes";
import {questions} from "../../state/selectors";
import * as RS from "reactstrap";
import {QUESTION_TYPES} from "../../services/questions";
import {DateString, NUMERIC_DATE_AND_TIME} from "../elements/DateString";
import {AccordionSectionContext} from "../../../IsaacAppTypes";
import {NOT_FOUND} from "../../services/constants";
import {RouteComponentProps, withRouter} from "react-router";
import {history} from "../../services/history";
import {useCurrentExamBoard} from "../../services/examBoard";
import {getRelatedConcepts} from "../../services/topics";
import {makeUrl} from "../../services/fastTrack";
import queryString from "query-string";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {IsaacLinkHints, IsaacTabbedHints} from "./IsaacHints";


type OwnProps = { doc: ApiTypes.IsaacQuestionPageDTO } & RouteComponentProps;
const stateToProps = (state: AppState, {doc, location: {search}}: OwnProps) => {
    const {board, questionHistory}: {board?: string; questionHistory?: string} = queryString.parse(search);
    const questionPart = questions.selectQuestionPart(doc.id)(state);
    const rest = {
        page: state && state.doc && state.doc !== NOT_FOUND ? state.doc : undefined,
        pageCompleted: state && state.questions ? state.questions.pageCompleted : undefined,
        board,
        questionHistory: questionHistory ? questionHistory.split(",") : []
    };
    return questionPart ? {
        validationResponse: questionPart.validationResponse,
        currentAttempt: questionPart.currentAttempt,
        canSubmit: questionPart.canSubmit && !questionPart.locked,
        locked: questionPart.locked,
        ...rest
    } : rest;
};

interface IsaacQuestionTabsProps {
    doc: ApiTypes.IsaacQuestionBaseDTO;
    currentAttempt?: ApiTypes.ChoiceDTO;
    canSubmit?: boolean;
    locked?: Date;
    validationResponse?: ApiTypes.QuestionValidationResponseDTO;
    page?: ApiTypes.ContentDTO;
    pageCompleted?: boolean;
    board?: string;
    questionHistory: string[];
}

function goToUrl(url: string, queryParams?: {[key: string]: string | undefined}) {
    history.push(makeUrl(url, queryParams));
}

function retryPreviousQuestion(questionHistory: string[], board?: string) {
    questionHistory = questionHistory.slice();
    let previousQuestionId = questionHistory.pop();
    let commaSeparatedQuestionHistory = questionHistory.join(',');

    return {
        value: "Retry previous question page",
        type: "button",
        onClick: function() {
            goToUrl('/question/' + previousQuestionId, {questionHistory: commaSeparatedQuestionHistory, board});
        }
    };
}

function backToBoard(board: string) {
    return {
        value: "Return to Top 10 Questions",
        type: "button",
        onClick: function() {
            goToUrl('/gameboards#' + board);
        }
    };
}

function showRelatedConceptPage(conceptPage: ApiTypes.ContentSummaryDTO) {
    return {
        type: "button",
        title: "Read suggested related concept page",
        value: "Read related concept page",
        onClick: function() {
            goToUrl(`/concepts/${conceptPage.id}`);
        },
    };
}

function tryEasierQuestion(easierQuestion: ApiTypes.ContentSummaryDTO, currentQuestionId: string|undefined, pageCompleted: boolean|undefined, questionHistory: string[], board: string|undefined) {
    if (!pageCompleted && currentQuestionId) {
        questionHistory = questionHistory.slice();
        questionHistory.push(currentQuestionId);
    }
    const commaSeparatedQuestionHistory = questionHistory.join(',');

    return {
        type: "button",
        title: `Try an easier question${easierQuestion.title ? " on " + easierQuestion.title.toLowerCase() : ""}`,
        value: "Easier question?",
        onClick: function() {
            goToUrl(`/questions/${easierQuestion.id}`, {questionHistory: commaSeparatedQuestionHistory, board});
        }
    };
}

function trySupportingQuestion(supportingQuestion: ApiTypes.ContentSummaryDTO, currentQuestionId: string|undefined, pageCompleted: boolean|undefined, questionHistory: string[], board: string|undefined) {
    if (!pageCompleted && currentQuestionId) {
        questionHistory = questionHistory.slice();
        questionHistory.push(currentQuestionId);
    }
    const commaSeparatedQuestionHistory = questionHistory.join(',');

    return {
        type: "button",
        title: `Try more questions of a similar difficulty${supportingQuestion.title ? " on " + supportingQuestion.title.toLowerCase() : ""}`,
        value: "More practice questions?",
        onClick: function() {
            goToUrl(`/questions/${supportingQuestion.id}`, {questionHistory: commaSeparatedQuestionHistory, board});
        }
    };
}

function getRelatedUnansweredEasierQuestions(doc: ApiTypes.IsaacQuestionBaseDTO, level: number) {
    return doc.relatedContent ? doc.relatedContent.filter((relatedContent) => {
        let isQuestionPage = relatedContent.type && ["isaacQuestionPage", "isaacFastTrackQuestionPage"].indexOf(relatedContent.type) >= 0;
        let isEasier = relatedContent.level && (parseInt(relatedContent.level, 10) < level);
        let isUnanswered = !relatedContent.correct;
        return isQuestionPage && isEasier && isUnanswered;
    }) : [];
}

function getRelatedUnansweredSupportingQuestions(doc: ApiTypes.IsaacQuestionBaseDTO, level: number) {
    return doc.relatedContent ? doc.relatedContent.filter((relatedContent) => {
        let isQuestionPage = relatedContent.type && ["isaacQuestionPage", "isaacFastTrackQuestionPage"].indexOf(relatedContent.type) >= 0;
        let isEqualOrHarder = relatedContent.level && (parseInt(relatedContent.level, 10) >= level);
        let isUnanswered = !relatedContent.correct;
        return isQuestionPage && isEqualOrHarder && isUnanswered;
    }) : [];
}

const IsaacQuestionComponent = ({doc, validationResponse, currentAttempt, canSubmit, locked, page, pageCompleted, board, questionHistory}: IsaacQuestionTabsProps) => {
    const dispatch = useDispatch();

    const accordion = useContext(AccordionSectionContext);

    useEffect((): (() => void) => {
        dispatch(registerQuestion(doc, accordion.clientId));
        return () => dispatch(deregisterQuestion(doc.id as string));
    }, [doc.id]);

    const examBoard = useCurrentExamBoard();

    function submitCurrentAttempt(event: React.FormEvent) {
        if (event) {event.preventDefault();}
        if (currentAttempt) {
            dispatch(attemptQuestion(doc.id as string, currentAttempt));
        }
    }

    const QuestionComponent = QUESTION_TYPES.get(doc.type) || QUESTION_TYPES.get("default");

    const sigFigsError = validationResponse && validationResponse.explanation &&
        (validationResponse.explanation.tags || []).includes("sig_figs");

    const isFastTrack = page && page.type === "isaacFastTrackQuestionPage";

    function determineFastTrackPrimaryAction() {
        let questionPartAnsweredCorrectly = validationResponse && validationResponse.correct;
        if (questionPartAnsweredCorrectly) {
            if (pageCompleted) {
                if (questionHistory.length) {
                    return retryPreviousQuestion(questionHistory, board);
                } else {
                    if (board  /* CHECKME: Seems disabled in Physics by commit 70c4b8af899dba7482c14c223412fb3b9ae2f38e:
                        && !questionPart.gameBoardCompletedPerfect*/) {
                        return backToBoard(board);
                    } else {
                        return null; // Gameboard completed
                    }
                }
            } else {
                return null; // CHECKME: Never existed in Physics: questionActions.goToNextQuestionPart();
            }
        } else  {
            return {
                disabled: !canSubmit,
                value: "Check my answer",
                type: "submit"
            };
        }
    }

    function determineFastTrackSecondaryAction() {
        const questionPartNotAnsweredCorrectly = !(validationResponse && validationResponse.correct);
        if (page) {
            if (questionPartNotAnsweredCorrectly) {
                const relatedUnansweredEasierQuestions = getRelatedUnansweredEasierQuestions(doc, page.level || 0);
                if (relatedUnansweredEasierQuestions.length > 0) {
                    const easierQuestion = relatedUnansweredEasierQuestions[0];
                    return tryEasierQuestion(easierQuestion, page.id, pageCompleted, questionHistory, board);
                }
            }
            const relatedUnansweredSupportingQuestions = getRelatedUnansweredSupportingQuestions(doc, page.level || 0);
            if (relatedUnansweredSupportingQuestions.length > 0) {
                const supportingQuestion = relatedUnansweredSupportingQuestions[0];
                return trySupportingQuestion(supportingQuestion, page.id, pageCompleted, questionHistory, board);
            }
        }
        if (doc.relatedContent && doc.relatedContent.length) {
            const relatedConcepts = getRelatedConcepts(doc, examBoard);
            if (relatedConcepts && relatedConcepts.length > 0) {
                return showRelatedConceptPage(relatedConcepts[0]);
            }
        } else {
            return null;
        }
    }

    const primaryAction = isFastTrack ? determineFastTrackPrimaryAction() : {
        disabled: !canSubmit,
        value: "Check my answer",
        type: "submit"
    };

    const secondaryAction = isFastTrack ? determineFastTrackSecondaryAction() : null;

    return <RS.Form onSubmit={submitCurrentAttempt}>
        {/* <h2 className="h-question d-flex pb-3">
            <span className="mr-3">{questionIndex !== undefined ? `Q${questionIndex + 1}` : "Question"}</span>
        </h2> */}
        {/* Difficulty bar */}

        <div className={`question-component p-md-5 ${doc.type === 'isaacParsonsQuestion' ? "parsons-layout" : ""}`}>
            <QuestionComponent questionId={doc.id as string} doc={doc} validationResponse={validationResponse} />
            {SITE_SUBJECT === SITE.CS &&
                <IsaacLinkHints questionPartId={doc.id as string} hints={doc.hints} />
            }

            {validationResponse && !canSubmit && <div className={`validation-response-panel p-3 mt-3 ${validationResponse.correct ? "correct" : ""}`}>
                <div className="pb-1">
                    <h1 className="m-0">{sigFigsError ? "Significant Figures" : validationResponse.correct ? "Correct!" : "Incorrect"}</h1>
                </div>
                {validationResponse.explanation && <div className="mb-2">
                    <IsaacContent doc={validationResponse.explanation} />
                </div>}
            </div>}

            {locked && <RS.Alert color="danger">
                This question is locked until at least {<DateString formatter={NUMERIC_DATE_AND_TIME}>{locked}</DateString>} to prevent repeated guessing.
            </RS.Alert>}

            {(!validationResponse || !validationResponse.correct || canSubmit) && !locked &&
                <div className="d-flex align-items-stretch flex-column-reverse flex-sm-row flex-md-column-reverse flex-lg-row">
                    {secondaryAction && <div
                        className={`text-center pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ${primaryAction ? "pr-sm-2 pr-md-0 pr-lg-3" : ""}`}
                    >
                        <input {...secondaryAction} className="btn btn-outline-primary btn-block" />
                    </div>}
                    {primaryAction && <div
                        className={`text-center pt-3 pb-1 w-100 w-sm-50 w-md-100 w-lg-50 ${secondaryAction ? "pl-sm-2 pl-md-0 pl-lg-3" : ""}`}
                    >
                        <input {...primaryAction} className="btn btn-secondary btn-block" />
                    </div>}
                </div>
            }

            {SITE_SUBJECT === SITE.CS && (!validationResponse || !validationResponse.correct || canSubmit) && <RS.Row>
                <RS.Col xl={{size: 10, offset: 1}} >
                    {doc.hints && <p className="no-print text-center pt-2 mb-0">
                        <small>{"Don't forget to use the hints above if you need help."}</small>
                    </p>}
                </RS.Col>
            </RS.Row>}

            {SITE_SUBJECT === SITE.PHY && !validationResponse?.correct &&
                <IsaacTabbedHints questionPartId={doc.id as string} hints={doc.hints} />
            }
        </div>
    </RS.Form>;
};

export const IsaacQuestion = withRouter<OwnProps>(connect(stateToProps)(IsaacQuestionComponent));
