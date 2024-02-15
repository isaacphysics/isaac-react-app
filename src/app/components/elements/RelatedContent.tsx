import React, { ReactNode } from "react";
import { Col, ListGroup, ListGroupItem, Row } from "reactstrap";
import { ContentDTO, ContentSummaryDTO } from "../../../IsaacApiTypes";
import { Link } from "react-router-dom";
import {
  AUDIENCE_DISPLAY_FIELDS,
  determineAudienceViews,
  difficultyShortLabelMap,
  DOCUMENT_TYPE,
  documentTypePathPrefix,
  filterAudienceViewsByProperties,
  isIntendedAudience,
  isTutorOrAbove,
  sortByNumberStringValue,
  sortByStringValue,
  stageLabelMap,
  useUserContext,
} from "../../services";
import { logAction, selectors, useAppDispatch, useAppSelector } from "../../state";
import { ConceptGameboardButton } from "./ConceptGameboardButton";

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
  return `/${documentTypePathPrefix[content.type as DOCUMENT_TYPE]}/${content.id}`;
}

function renderQuestions(
  allQuestions: ContentSummaryDTO[],
  renderItem: RenderItemFunction,
  conceptId: string,
  showConceptGameboardButton: boolean,
) {
  const halfWayIndex = Math.ceil(allQuestions.length / 2) - 1;
  const firstColQuestions = allQuestions.filter((q, i) => i <= halfWayIndex);
  const secondColQuestions = allQuestions.filter((q, i) => i > halfWayIndex);

  if (allQuestions.length == 0) return null;
  return (
    <div className="d-flex align-items-stretch flex-wrap no-print">
      <div className="w-100 d-flex">
        <div className="flex-fill simple-card my-3 p-3 text-wrap">
          <Row className="related-questions related-title">
            <Col className={"col-auto"}>
              <h5 className="my-2">Related questions</h5>
            </Col>
            {showConceptGameboardButton && (
              <Col className={"ml-auto col-auto vertical-center text-right"}>
                <ConceptGameboardButton conceptId={conceptId} />
              </Col>
            )}
          </Row>
          <hr />
          {/* Large devices - multi column */}
          <div className="d-none d-lg-flex">
            <ListGroup className="w-50">
              {firstColQuestions.map((contentSummary) => renderItem(contentSummary))}
            </ListGroup>
            <ListGroup className="w-50">
              {secondColQuestions.map((contentSummary) => renderItem(contentSummary))}
            </ListGroup>
          </div>
          {/* Small devices - single column */}
          <div className="d-lg-none">
            <ListGroup>{allQuestions.map((contentSummary) => renderItem(contentSummary))}</ListGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RelatedContent({ content, parentPage, conceptId = "" }: RelatedContentProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectors.user.orNull);
  const userContext = useUserContext();
  const audienceFilteredContent = content.filter((c) => isIntendedAudience(c.audience, userContext, user));
  const showConceptGameboardButton = isTutorOrAbove(useAppSelector(selectors.user.orNull));

  // level, difficulty, title; all ascending (reverse the calls for required ordering)
  const sortedContent = audienceFilteredContent
    .sort(sortByStringValue("title"))
    .sort(sortByNumberStringValue("difficulty"))
    .sort(sortByNumberStringValue("level")); // TODO should this reference to level still be here?

  const questions = sortedContent.filter((contentSummary) => contentSummary.type === DOCUMENT_TYPE.QUESTION);

  const makeListGroupItem: RenderItemFunction = (contentSummary: ContentSummaryDTO) => {
    const audienceViews = filterAudienceViewsByProperties(
      determineAudienceViews(contentSummary.audience),
      AUDIENCE_DISPLAY_FIELDS,
    );
    return (
      <ListGroupItem key={getURLForContent(contentSummary)} className="w-100 mr-lg-3">
        <Link
          to={getURLForContent(contentSummary)}
          onClick={() => {
            dispatch(logAction(getEventDetails(contentSummary, parentPage)));
          }}
        >
          {contentSummary.title}
          {audienceViews.length > 0 && " ("}
          {audienceViews
            .map((av) => {
              let result = "";
              if (av.stage) {
                result += stageLabelMap[av.stage];
              }
              if (av.stage && av.difficulty) {
                result += " - ";
              }
              if (av.difficulty) {
                result += difficultyShortLabelMap[av.difficulty];
              }
              return result;
            })
            .join(", ")}
          {audienceViews.length > 0 && ")"}
        </Link>
      </ListGroupItem>
    );
  };

  return renderQuestions(questions, makeListGroupItem, conceptId, showConceptGameboardButton);
}
