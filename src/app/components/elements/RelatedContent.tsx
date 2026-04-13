import React, {ReactNode} from "react";
import {Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    isAda,
    isIntendedAudience,
    isTutorOrAbove,
    sortByStringValue,
    useUserViewingContext
} from "../../services";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import {ConceptGameboardButton} from "./ConceptGameboardButton";

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
    return `/${documentTypePathPrefix[content.type as DOCUMENT_TYPE]}/${content.id}`;
}

function renderQuestions(audienceQuestions: ContentSummaryDTO[], remainingQuestions: ContentSummaryDTO[], renderItem: RenderItemFunction, conceptId: string, showConceptGameboardButton: boolean) {

    if (audienceQuestions.length + remainingQuestions.length == 0) return null;
    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 d-flex">
            <div className="flex-fill simple-card my-3 p-3 text-wrap">
                <Row className="related-questions related-title">
                    <Col xs={12} sm={"auto"}>
                        <img className={"related-q-icon mt-n2 ms-2 me-3"} src={"/assets/cs/icons/status-not-started.svg"} alt=""/>
                        <h3 className="d-inline-block mt-2">Related questions</h3>
                    </Col>
                    {showConceptGameboardButton && <Col xs={12} sm={"auto"} className={"ms-md-auto mt-2 mt-md-0 vertical-center justify-content-start"}>
                        <ConceptGameboardButton conceptId={conceptId}/>
                    </Col>}
                </Row>
                <hr/>
                {/* Large devices - multi column */}
                <div className="d-none d-lg-flex text-start">
                    <ListGroup className="w-50">
                        <h4 className="related-question-header">On your specification:</h4>
                        {audienceQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                    <ListGroup className="w-50">
                        <h4 className="related-question-header">Outside your specification:</h4>
                        {remainingQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                </div>
                {/* Small devices - single column */}
                <div className="d-lg-none text-start">
                    <ListGroup>
                        {audienceQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                </div>
                <h4 className="d-lg-none related-question-header mt-4">Outside your specification:</h4>
                <div className="d-lg-none text-start">
                    <ListGroup>
                        {remainingQuestions.map(contentSummary => renderItem(contentSummary))}
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>;
}

export function RelatedContent({content, parentPage, conceptId = ""}: RelatedContentProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();
    const audienceFilteredContent = content.filter(c => isIntendedAudience(c.audience, userContext, user));
    const remainingContent: ContentSummaryDTO[] = content.filter(c => !isIntendedAudience(c.audience, userContext, user));
    const showConceptGameboardButton = isTutorOrAbove(useAppSelector(selectors.user.orNull));

    const sortedContent = audienceFilteredContent.sort(sortByStringValue("title"));

    const sortedRemainder: ContentSummaryDTO[] = remainingContent.sort(sortByStringValue("title"));

    const questions = sortedContent
        .filter(contentSummary => contentSummary.type === DOCUMENT_TYPE.QUESTION || contentSummary.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION);
    const remainingQuestions = sortedRemainder
        .filter(contentSummary => contentSummary.type === DOCUMENT_TYPE.QUESTION || contentSummary.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION);

    const makeListGroupItem: RenderItemFunction = (contentSummary: ContentSummaryDTO) => {
        return <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 me-lg-3">
            <Link
                className="btn-link btn text-start"
                to={getURLForContent(contentSummary)}
                onClick={async () => await dispatch(logAction(getEventDetails(contentSummary, parentPage)))}
            >
                <span className="font-size-1 fw-regular">
                    {contentSummary.title}
                </span>
            </Link>
        </ListGroupItem>;
    };

    return isAda ? renderQuestions(questions, remainingQuestions, makeListGroupItem, conceptId, showConceptGameboardButton) : null;
}
