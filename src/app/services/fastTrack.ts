import {getRelatedConcepts} from "./topics";
import {history} from "./history";
import * as ApiTypes from "../../IsaacApiTypes";
import {ContentDTO, QuestionDTO} from "../../IsaacApiTypes";
import {DOCUMENT_TYPE, NOT_FOUND} from "./constants";
import {useUserContext, UseUserContextReturnType} from "./userContext";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import queryString from "query-string";
import {Location} from "history";
import {PotentialUser} from "../../IsaacAppTypes";
import {selectors} from "../state/selectors";

export function makeUrl(url: string, queryParams?: { [p: string]: string | undefined }) {
    function valueIsNotUndefined(v: [string, string | undefined]): v is [string, string] {
        return v[1] !== undefined;
    }

    const query = queryParams ? "?" + Object.entries(queryParams)
        .filter(valueIsNotUndefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&") : "";
    return url + query;
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
            goToUrl('/questions/' + previousQuestionId, {questionHistory: commaSeparatedQuestionHistory, board});
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

function getRelatedUnansweredEasierQuestions(doc: ApiTypes.QuestionDTO, level: number) {
    return doc.relatedContent ? doc.relatedContent.filter((relatedContent) => {
        let isQuestionPage = relatedContent.type && [DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.FAST_TRACK_QUESTION].indexOf(relatedContent.type as DOCUMENT_TYPE) >= 0;
        let isEasier = relatedContent.level && (parseInt(relatedContent.level, 10) < level);
        let isUnanswered = !relatedContent.correct;
        return isQuestionPage && isEasier && isUnanswered;
    }) : [];
}

function getRelatedUnansweredSupportingQuestions(doc: ApiTypes.QuestionDTO, level: number) {
    return doc.relatedContent ? doc.relatedContent.filter((relatedContent) => {
        let isQuestionPage = relatedContent.type && [DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.FAST_TRACK_QUESTION].indexOf(relatedContent.type as DOCUMENT_TYPE) >= 0;
        let isEqualOrHarder = relatedContent.level && (parseInt(relatedContent.level, 10) >= level);
        let isUnanswered = !relatedContent.correct;
        return isQuestionPage && isEqualOrHarder && isUnanswered;
    }) : [];
}

interface FastTrackPageProperties {
    isFastTrackPage: boolean;
    doc: QuestionDTO;
    correct: boolean;
    page: ContentDTO | undefined;
    pageCompleted: boolean;
    questionHistory: string[];
    board: string | undefined;
    userContext: UseUserContextReturnType;
    user: PotentialUser | null;
    canSubmit: boolean;
}

export function useFastTrackInformation(
    doc: QuestionDTO, location: Location<unknown>,
    canSubmit = true, correct = false
): FastTrackPageProperties {
    const {board, questionHistory: questionHistoryUrl}: {board?: string; questionHistory?: string} = queryString.parse(location.search);
    const questionHistory = questionHistoryUrl?.split(",") || [];

    const page = useSelector((state: AppState) => state?.doc && state.doc !== NOT_FOUND ? state.doc : undefined);
    const isFastTrackPage = page?.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION;
    const pageCompleted = useSelector((state: AppState) => state?.questions ? state.questions.pageCompleted : false);
    const userContext = useUserContext();
    const user = useSelector(selectors.user.orNull);

    return {isFastTrackPage, doc, correct, page, pageCompleted, questionHistory, board, userContext, user, canSubmit}
}

export function determineFastTrackPrimaryAction(questionPart: FastTrackPageProperties) {
    if (questionPart.correct) {
        if (questionPart.pageCompleted) {
            if (questionPart.questionHistory.length) {
                return retryPreviousQuestion(questionPart.questionHistory, questionPart.board);
            } else {
                if (questionPart.board) {
                    return backToBoard(questionPart.board);
                }
            }
        } else {
            return null; // Never existed on old site but could: questionActions.goToNextQuestionPart();
        }
    } else  {
        return {
            disabled: !questionPart.canSubmit,
            value: "Check my answer",
            type: "submit"
        };
    }
}

export function determineFastTrackSecondaryAction(questionPart: FastTrackPageProperties) {
    if (questionPart.page) {
        if (!questionPart.correct) {
            const relatedUnansweredEasierQuestions =
                getRelatedUnansweredEasierQuestions(questionPart.doc, questionPart.page.level || 0);
            if (relatedUnansweredEasierQuestions.length > 0) {
                const easierQuestion = relatedUnansweredEasierQuestions[0];
                return tryEasierQuestion(
                    easierQuestion, questionPart.page.id, questionPart.pageCompleted,
                    questionPart.questionHistory, questionPart.board);
            }
        }
        const relatedUnansweredSupportingQuestions =
            getRelatedUnansweredSupportingQuestions(questionPart.doc, questionPart.page.level || 0);
        if (relatedUnansweredSupportingQuestions.length > 0) {
            const supportingQuestion = relatedUnansweredSupportingQuestions[0];
            return trySupportingQuestion(
                supportingQuestion, questionPart.page.id, questionPart.pageCompleted,
                questionPart.questionHistory, questionPart.board);
        }
    }
    if (questionPart.doc.relatedContent && questionPart.doc.relatedContent.length) {
        const relatedConcepts = getRelatedConcepts(questionPart.doc, questionPart.userContext, questionPart.user);
        if (relatedConcepts && relatedConcepts.length > 0) {
            return showRelatedConceptPage(relatedConcepts[0]);
        }
    } else {
        return null;
    }
}
