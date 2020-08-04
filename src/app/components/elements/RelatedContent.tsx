import React, {ReactNode} from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {DOCUMENT_TYPE, documentTypePathPrefix} from "../../services/constants";
import {useDispatch} from "react-redux";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {sortByNumberStringValue, sortByStringValue} from "../../services/sorting";
import {logAction} from "../../state/actions";

interface RelatedContentProps {
    content: ContentSummaryDTO[];
    parentPage: ContentDTO;
}

type RenderItemFunction = (contentSummary: ContentSummaryDTO, openInNewTab?: boolean) => ReactNode;

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

function renderQuestions(allQuestions: ContentSummaryDTO[], renderItem: RenderItemFunction) {
    const halfWayIndex = Math.ceil(allQuestions.length / 2) - 1;
    const firstColQuestions = allQuestions.filter((q, i) => i <= halfWayIndex);
    const secondColQuestions = allQuestions.filter((q, i) => i > halfWayIndex);

    if (allQuestions.length == 0) return null;
    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 d-flex">
            <div className="flex-fill simple-card my-3 p-3 text-wrap">
                <div className="related-questions related-title">
                    <h5 className="my-2">Related questions</h5>
                </div>
                <hr/>
                {/* Large devices - multi column */}
                <div className="d-none d-lg-flex">
                    <ListGroup className="w-50">
                        {firstColQuestions.map(contentSummary => renderItem(contentSummary, SITE_SUBJECT == SITE.CS))}
                    </ListGroup>
                    <ListGroup className="w-50">
                        {secondColQuestions.map(contentSummary => renderItem(contentSummary, SITE_SUBJECT == SITE.CS))}
                    </ListGroup>
                </div>
                {/* Small devices - single column */}
                <div className="d-lg-none">
                    <ListGroup>
                        {allQuestions.map(contentSummary => renderItem(contentSummary, SITE_SUBJECT == SITE.CS))}
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>
}

function renderConceptsAndQuestions(concepts: ContentSummaryDTO[], questions: ContentSummaryDTO[], renderItem: RenderItemFunction) {
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
                </div>
                <hr/>
                <div className="d-lg-flex">
                    <ListGroup className="mr-lg-3">
                        {questions.length > 0 ?
                            questions.map(contentSummary => renderItem(contentSummary, SITE_SUBJECT == SITE.CS)) :
                            <div className="mt-2 ml-3">There are no related questions</div>
                        }
                    </ListGroup>
                </div>
            </div>
        </div>
    </div>
}

export function RelatedContent({content, parentPage}: RelatedContentProps) {
    const dispatch = useDispatch();

    // level, difficulty, title; all ascending (reverse the calls for required ordering)
    const sortedContent = content
        .sort(sortByStringValue("title"))
        .sort(sortByNumberStringValue("difficulty"))
        .sort(sortByNumberStringValue("level"));

    const concepts = sortedContent
        .filter((contentSummary) => contentSummary.type == DOCUMENT_TYPE.CONCEPT);
    const questions = sortedContent
        .filter((contentSummary) => contentSummary.type == DOCUMENT_TYPE.QUESTION);

    const makeListGroupItem: RenderItemFunction = (contentSummary: ContentSummaryDTO, openInNewTab?: boolean) => (
        <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 mr-lg-3">
            <Link
                to={getURLForContent(contentSummary)}
                onClick={() => {dispatch(logAction(getEventDetails(contentSummary, parentPage)))}}
                target={openInNewTab ? "_blank" : undefined}
            >
                {contentSummary.title}
                {/*TODO CS Level*/}
                {SITE_SUBJECT === SITE.PHY && contentSummary.level && contentSummary.level != '0' && " (Level " + contentSummary.level + ")"}
            </Link>
        </ListGroupItem>
    );

    return {
        [SITE.PHY]: renderConceptsAndQuestions(concepts, questions, makeListGroupItem),
        [SITE.CS]: renderQuestions(questions, makeListGroupItem)
    }[SITE_SUBJECT];
}
