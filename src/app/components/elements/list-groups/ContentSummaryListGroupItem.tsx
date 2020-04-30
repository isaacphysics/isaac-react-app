import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {DOCUMENT_TYPE, SEARCH_RESULT_TYPE, TAG_ID, TAG_LEVEL} from "../../../services/constants";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";
import tags from "../../../services/tags";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";

export const ContentSummaryListGroupItem = ({item, search, displayTopicTitle}: {item: ContentSummaryDTO; search?: string; displayTopicTitle?: boolean}) => {
    let linkDestination, icon, iconLabel;
    let itemClasses = "p-0 bg-transparent content-summary-link ";

    let titleClasses = "content-summary-link-title flex-grow-1 ";
    let titleTextClass = SITE_SUBJECT == SITE.PHY ? "text-secondary" : undefined;
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[]);
    if (itemSubject) {
        titleClasses += itemSubject.id;
    }

    const itemTopic = tags.getSpecifiedTag(TAG_LEVEL.topic, item.tags as TAG_ID[]);
    const topicTitle = itemTopic ? itemTopic.title : null;

    switch (item.type) {
        case (SEARCH_RESULT_TYPE.SHORTCUT):
            linkDestination = item.url;
            icon = "▶"; //"🎯";
            iconLabel = "Shortcut icon";
            break;
        case (DOCUMENT_TYPE.QUESTION):
            itemClasses += item.correct ? "bg-success" : "text-info";
            linkDestination = `/questions/${item.id}`;
            icon = item.correct ? "✓" : "Q ";
            iconLabel = item.correct ? "Completed question icon" : "Question icon";
            break;
        case (DOCUMENT_TYPE.CONCEPT):
        default:
            linkDestination = `/concepts/${item.id}`;
            icon = "📝";
            iconLabel = "Concept page icon";
    }
    return <RS.ListGroupItem className={itemClasses} key={linkDestination}>
        <Link className="p-3 pr-4" to={{pathname: linkDestination, search: search}}>
            <span className="content-summary-link-title align-self-center" role="img" aria-label={iconLabel}>{icon}</span>
            <div className={titleClasses}>
                <span className={titleTextClass}>{item.title}</span>
                {item.summary && <div className="small text-muted d-none d-md-block">{item.summary}</div>}
            </div>
            {displayTopicTitle && <span className="small text-muted align-self-center d-none d-md-inline">{topicTitle}</span>}
        </Link>
    </RS.ListGroupItem>;
};

export const linkToContent = (search: string | undefined, item: ContentSummaryDTO, displayTopicTitle: boolean | undefined) => {
    return <ContentSummaryListGroupItem item={item} search={search} key={item.type + "/" + item.id} displayTopicTitle={displayTopicTitle}/>
};

export const LinkToContentSummaryList = ({items, search, displayTopicTitle, ...rest}: {
    items: ContentSummaryDTO[];
    search?: string;
    displayTopicTitle?: boolean;
    tag?: React.ElementType;
    flush?: boolean;
    className?: string;
    cssModule?: any;
}) => {
    return <RS.ListGroup {...rest} className="mb-3 link-list list-group-links">
        {items.map(item => linkToContent(search, item, displayTopicTitle))}
    </RS.ListGroup>;
};
