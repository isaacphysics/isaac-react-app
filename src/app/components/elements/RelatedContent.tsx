import React from "react";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";
import {DOCUMENT_TYPE, documentTypePathPrefix} from "../../services/constants";
import {connect} from "react-redux";
import {logAction} from "../../state/actions";
import {func} from "prop-types";

interface RelatedContentProps {
    content: ContentSummaryDTO[];
    parentPage: ContentDTO;
    logAction: (eventDetails: any) => void;
}

function getEventDetails(contentSummary: ContentSummaryDTO, parentPage: ContentDTO) {
    const eventDetails: any = {};

    // Where are we linking to?
    switch (contentSummary.type as DOCUMENT_TYPE) {
        case DOCUMENT_TYPE.CONCEPT:
            eventDetails.type = "VIEW_RELATED_CONCEPT";
            eventDetails.relatedConceptId = contentSummary.id;
            break;
        case DOCUMENT_TYPE.QUESTION:
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

export const RelatedContentComponent = ({content, parentPage, logAction}: RelatedContentProps) => {
    return <div className="simple-card my-3 my-md-5 p-3 p-md-5 text-wrap">
        <h2 className="mb-4">Related Content</h2>
        <div className="d-lg-flex">
            <ListGroup className="w-100 mb-lg-3 mr-lg-3 w-lg-50">
                {content.map((contentSummary) => (
                    <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 mb-lg-3 mr-lg-3 w-lg-50">
                        <Link
                            to={getURLForContent(contentSummary)}
                            className="lrg-text font-weight-bold"
                            onClick={() => {logAction(getEventDetails(contentSummary, parentPage))}}
                        >
                            {contentSummary.title}
                        </Link>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    </div>
};

export const RelatedContent = connect(null, {logAction: logAction})(RelatedContentComponent);
