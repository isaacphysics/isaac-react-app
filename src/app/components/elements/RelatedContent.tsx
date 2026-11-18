import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {ContentDTO, ContentSummaryDTO} from "../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import {
    DOCUMENT_TYPE,
    isIntendedAudience,
    sortByStringValue,
    useUserViewingContext
} from "../../services";
import {logAction, selectors, useAppDispatch, useAppSelector} from "../../state";
import classNames from "classnames";
import i18next from "i18next";
import {getEventDetails} from "./sidebar/SidebarElements";

const RelatedQuestion = ({question, parentPage}: {question: ContentSummaryDTO, parentPage: ContentDTO}) => {
    const dispatch = useAppDispatch();

    const parentPageType = parentPage.type === DOCUMENT_TYPE.CONCEPT ? "concept"
        : parentPage.type === DOCUMENT_TYPE.GENERIC ? "page" : "question";

    return <ListGroupItem className="w-100 me-lg-3">
        <Link
            className="btn-link btn text-start"
            to={`/questions/${question.id}`}
            onClick={async () => await dispatch(logAction(getEventDetails(question, parentPageType, parentPage.id)))}
        >
            <span className="font-size-1 fw-regular">
                {question.title}
            </span>
        </Link>
    </ListGroupItem>;
};

interface RelatedContentProps {
    content: ContentSummaryDTO[];
    parentPage: ContentDTO;
}

export function RelatedContent({content, parentPage}: RelatedContentProps) {
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    const filteredandSortedContent = content.filter(contentSummary => 
        [DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.FAST_TRACK_QUESTION].includes(contentSummary.type as DOCUMENT_TYPE)
    ).sort(sortByStringValue("title"));

    const audienceQuestions = filteredandSortedContent.filter(c => isIntendedAudience(c.audience, userContext, user));
    const remainingQuestions: ContentSummaryDTO[] = filteredandSortedContent.filter(c => !isIntendedAudience(c.audience, userContext, user));

    if (audienceQuestions.length + remainingQuestions.length == 0) return null;

    return <div className="d-flex align-items-stretch flex-wrap no-print">
        <div className="w-100 d-flex">
            <div className="simple-card flex-fill my-3 p-3 text-wrap">
                <div className="related-questions">
                    <i className="icon icon-raw icon-not-started icon-lg mb-n2 ms-2 me-3" />
                    <h3 className="d-inline-block mt-2">{i18next.t("common:title.relatedQuestions")}</h3>
                </div>
                <hr/>
                <div className="d-md-flex text-start">
                    {audienceQuestions.length > 0 && <div className={classNames({"w-md-50": remainingQuestions.length > 0})}>
                        <div className="ps-3 h4">{i18next.t("questions:relatedContent.questions.specificationHeader")}</div>
                        <ListGroup>
                            {audienceQuestions.map((contentSummary, i) => 
                                <RelatedQuestion key={`audience-question-${i}`} question={contentSummary} parentPage={parentPage} />
                            )}
                        </ListGroup>
                    </div>}
                    {remainingQuestions.length > 0 && <div className={classNames("mt-4 mt-md-0", {"w-md-50": audienceQuestions.length > 0})}>
                        <div className="ps-3 h4">{i18next.t("questions:relatedContent.questions.outsideSpecificationHeader")}</div>
                        <ListGroup>
                            {remainingQuestions.map((contentSummary, i) => 
                                <RelatedQuestion key={`remaining-question-${i}`} question={contentSummary} parentPage={parentPage} />
                            )}
                        </ListGroup>
                    </div>}
                </div>
            </div>
        </div>
    </div>;
}
