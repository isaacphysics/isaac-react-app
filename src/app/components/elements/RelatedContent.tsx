import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {DOCUMENT_TYPE, documentTypePathPrefix} from "../../services/constants";
import {connect} from "react-redux";
import {logAction} from "../../state/actions";

interface RelatedContentProps {
    content: ContentSummaryDTO[];
    parentPage: ContentDTO;
    logAction: (eventDetails: object) => void;
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
    const concepts = content.filter((contentSummary) => contentSummary.type == DOCUMENT_TYPE.CONCEPT);
    const questions = content.filter((contentSummary) => contentSummary.type == DOCUMENT_TYPE.QUESTION).sort((a, b) => {
        if (a.level === b.level) return ((a.title || '').localeCompare((b.title || ''), undefined, { numeric: true, sensitivity: 'base' }));
        const aInt = parseInt(a.level || '-1');
        const bInt = parseInt(b.level || '-1');
        return aInt > bInt ? 1 : aInt != bInt ? -1 : 0;
    });

    const makeListGroupItem = (contentSummary: ContentSummaryDTO) => (
        <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 mr-lg-3">
            <Link to={getURLForContent(contentSummary)}
                onClick={() => {logAction(getEventDetails(contentSummary, parentPage))}}
            >
                {contentSummary.level && contentSummary.level != '0' ? (contentSummary.title + " (Level " + contentSummary.level + ")") : contentSummary.title}
            </Link>
        </ListGroupItem>
    );
    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 w-lg-50 d-flex">
            <div className="flex-fill simple-card mr-lg-3 my-3 p-3 text-wrap">
                <div className="related-concepts related-title">
                    <h5 className="mb-2">Related concepts</h5>
                </div>
                <hr/>
                <div className="d-lg-flex">
                    <ListGroup className="mr-lg-3">
                        {concepts.length > 0 ?
                            concepts.map(contentSummary => makeListGroupItem(contentSummary)):
                            <div className="mt-2 ml-3">There are no related concepts</div>
                        }
                    </ListGroup>
                </div>
            </div>
        </div>
        <div className="w-100 w-lg-50 d-flex">
            <div className="flex-fill simple-card ml-lg-3 my-3 p-3 text-wrap">
                <div className="related-questions related-title">
                    <h5 className="mb-2">Related questions</h5>
                </div>
                <hr/>
                <div className="d-lg-flex">
                    <ListGroup className="mr-lg-3">
                        {questions.length > 0 ?
                            questions.map(contentSummary => makeListGroupItem(contentSummary)) :
                            <div className="mt-2 ml-3">There are no related questions</div>
                        }
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>
};

export const RelatedContent = connect(null, {logAction: logAction})(RelatedContentComponent);
