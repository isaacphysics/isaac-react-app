import React, {ReactNode} from "react";
import {Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    difficultyShortLabelMap,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    filterAudienceViewsByProperties,
    isAda,
    isIntendedAudience,
    isPhy,
    isTutorOrAbove,
    siteSpecific,
    sortByNumberStringValue,
    sortByStringValue,
    stageLabelMap,
    useUserContext
} from "../../services";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {ConceptGameboardButton} from "./ConceptGameboardButton";
import classNames from "classnames";

interface RelatedContentProps {
    content: ContentSummaryDTO[];
    conceptId?: string;
    parentPage: ContentDTO;
}

type RenderItemFunction = (contentSummary: ContentSummaryDTO) => ReactNode;

function getEventDetails(contentSummary: ContentSummaryDTO, parentPage: ContentDTO) {
    const eventDetails: any = {};

    // Where are we linking to?
    switch (contentSummary.type as DOCUMENT_TYPE) {
        case DOCUMENT_TYPE.CONCEPT:
            eventDetails.type = "VIEW_RELATED_CONCEPT";
            eventDetails.relatedConceptId = contentSummary.id;
            break;
        case DOCUMENT_TYPE.QUESTION:
        case DOCUMENT_TYPE.FAST_TRACK_QUESTION:
            eventDetails.type = "VIEW_RELATED_QUESTION";
            eventDetails.relatedQuestionId = contentSummary.id;
            break;
        case DOCUMENT_TYPE.GENERIC:
            eventDetails.type = "VIEW_RELATED_PAGE";
            eventDetails.relatedPageId = contentSummary.id;
    }
    // Where have we linked from?
    switch (parentPage.type as DOCUMENT_TYPE) {
        case DOCUMENT_TYPE.CONCEPT:
            eventDetails.conceptId = parentPage.id;
            break;
        case DOCUMENT_TYPE.QUESTION:
        case DOCUMENT_TYPE.FAST_TRACK_QUESTION:
            eventDetails.questionId = parentPage.id;
            break;
        case DOCUMENT_TYPE.GENERIC:
            eventDetails.pageId = parentPage.id;
    }
    return eventDetails;
}

function getURLForContent(content: ContentSummaryDTO) {
    return `/${documentTypePathPrefix[content.type as DOCUMENT_TYPE]}/${content.id}`
}

function renderQuestionsCS(allQuestions: ContentSummaryDTO[], renderItem: RenderItemFunction, conceptId: string, showConceptGameboardButton: boolean) {
    const halfWayIndex = Math.ceil(allQuestions.length / 2) - 1;
    const firstColQuestions = allQuestions.filter((q, i) => i <= halfWayIndex);
    const secondColQuestions = allQuestions.filter((q, i) => i > halfWayIndex);

    if (allQuestions.length == 0) return null;
    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 d-flex">
            <div className="flex-fill simple-card my-3 p-3 text-wrap">
                <Row className="related-questions related-title">
                    <Col xs={12} sm={"auto"}>
                        <img className={"related-q-icon mt-n2 ml-2 mr-3"} src={"/assets/cs/icons/question-not-started.svg"}/>
                        <h3 className="d-inline-block mt-2">Related questions</h3>
                    </Col>
                    {showConceptGameboardButton && <Col xs={12} sm={"auto"} className={"ml-md-auto mt-2 mt-md-0 vertical-center justify-content-start"}>
                        <ConceptGameboardButton conceptId={conceptId}/>
                    </Col>}
                </Row>
                <hr/>
                {/* Large devices - multi column */}
                <div className="d-none d-lg-flex text-left">
                    <ListGroup className="w-50">
                        {firstColQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                    <ListGroup className="w-50">
                        {secondColQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                </div>
                {/* Small devices - single column */}
                <div className="d-lg-none text-left">
                    <ListGroup>
                        {allQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>
}

function renderConceptsAndQuestionsPhy(concepts: ContentSummaryDTO[], questions: ContentSummaryDTO[], renderItem: RenderItemFunction, conceptId: string, showConceptGameboardButton: boolean) {
    if (concepts.length == 0 && questions.length == 0) return null;
    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 w-lg-50 d-flex">
            <div className="flex-fill simple-card mr-lg-3 my-3 p-3 text-wrap">
                <div className="related-concepts related-title">
                    <h5 className="mb-2">Related Concepts</h5>
                </div>
                <hr/>
                <div className="d-lg-flex">
                    <ListGroup className="mr-lg-3">
                        {concepts.length > 0 ?
                            concepts.map(contentSummary => renderItem(contentSummary)):
                            <div className="mt-2 ml-3">There are no related concepts</div>
                        }
                    </ListGroup>
                </div>
            </div>
        </div>
        <div className="w-100 w-lg-50 d-flex">
            <div className="flex-fill simple-card ml-lg-3 my-3 p-3 text-wrap">
                <div className="related-questions related-title">
                    <h5 className="mb-2">Related Questions</h5>
                    {showConceptGameboardButton && questions.length > 0 && <p className="text-right">
                        <ConceptGameboardButton conceptId={conceptId}/>
                    </p>}
                </div>
                <hr/>
                <div className="d-lg-flex">
                    <ListGroup className="mr-lg-3">
                        {questions.length > 0 ?
                            questions.map(contentSummary => renderItem(contentSummary)) :
                            <div className="mt-2 ml-3">There are no related questions</div>
                        }
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>
}

export function RelatedContent({content, parentPage, conceptId = ""}: RelatedContentProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();
    const audienceFilteredContent = content.filter(c => isPhy || isIntendedAudience(c.audience, userContext, user));
    const showConceptGameboardButton = isAda && isTutorOrAbove(useAppSelector(selectors.user.orNull));

    const sortedContent = siteSpecific(
        // level, difficulty, title; all ascending (reverse the calls for required ordering)
        (c: ContentSummaryDTO[]) => c.sort(sortByStringValue("title"))
            .sort(sortByNumberStringValue("difficulty"))
            .sort(sortByNumberStringValue("level")), // TODO should this reference to level still be here?
        // On Ada, just sort by title (ascending)
        (c: ContentSummaryDTO[]) => c.sort(sortByStringValue("title"))
    )(audienceFilteredContent);

    const concepts = sortedContent
        .filter(contentSummary => contentSummary.type === DOCUMENT_TYPE.CONCEPT);
    const questions = sortedContent
        .filter(contentSummary => contentSummary.type === DOCUMENT_TYPE.QUESTION || contentSummary.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION);

    const makeListGroupItem: RenderItemFunction = (contentSummary: ContentSummaryDTO) => {
        const audienceViews = filterAudienceViewsByProperties(determineAudienceViews(contentSummary.audience), AUDIENCE_DISPLAY_FIELDS);
        return <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 mr-lg-3">
            <Link
                className={classNames({"btn-link btn text-left": isAda})}
                to={getURLForContent(contentSummary)}
                onClick={() => {
                    dispatch(logAction(getEventDetails(contentSummary, parentPage)))
                }}
            >
                <span className={classNames({"font-size-1 font-weight-regular": isAda})}>
                    {contentSummary.title}
                    {isPhy && <React.Fragment>
                        {audienceViews.length > 0 && " ("}
                        {audienceViews.map(av => {
                            let result = "";
                            if (av.stage) {result += stageLabelMap[av.stage]}
                            if (av.stage && av.difficulty) {result += " - "}
                            if (av.difficulty) {result += difficultyShortLabelMap[av.difficulty]}
                            return result;
                        }).join(", ")}
                        {audienceViews.length > 0 && ")"}
                    </React.Fragment>}
                </span>
            </Link>
        </ListGroupItem>
    };

    return siteSpecific(
        // Physics
        renderConceptsAndQuestionsPhy(concepts, questions, makeListGroupItem, conceptId, showConceptGameboardButton),
        // Computer Science
        renderQuestionsCS(questions, makeListGroupItem, conceptId, showConceptGameboardButton)
    );
}
