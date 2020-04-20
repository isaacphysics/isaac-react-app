import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {DOCUMENT_TYPE, SEARCH_RESULT_TYPE, TAG_ID, TAG_LEVEL} from "../../../services/constants";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";
import tags from "../../../services/tags";

export const ContentSummaryListGroupItem = ({item, search, displayTopicTitle}: {item: ContentSummaryDTO; search?: string; displayTopicTitle?: boolean}) => {
    let linkDestination, icon, iconLabel, topicTitle;
    let itemClasses = "p-3 bg-transparent content-summary-link ";
    let itemTopic = tags.getSpecifiedTag(TAG_LEVEL.topic, item.tags as TAG_ID[]);
    switch (item.type) {
        case (SEARCH_RESULT_TYPE.SHORTCUT):
            linkDestination = item.url;
            icon = "▶"; //"🎯";
            iconLabel = "Shortcut icon";
            topicTitle = itemTopic ? itemTopic.title : null;
            break;
        case (DOCUMENT_TYPE.QUESTION):
            itemClasses += item.correct ? "bg-success" : "text-info";
            linkDestination = `/questions/${item.id}`;
            icon = item.correct ? "✓" : "Q ";
            iconLabel = item.correct ? "Completed question icon" : "Question icon";
            topicTitle = itemTopic ? itemTopic.title : null;
            break;
        case (DOCUMENT_TYPE.CONCEPT):
        default:
            itemClasses += "";
            linkDestination = `/concepts/${item.id}`;
            icon = "📝";
            iconLabel = "Concept page icon";
            topicTitle = itemTopic ? itemTopic.title : null;
    }
    return <RS.ListGroupItem className={itemClasses} key={linkDestination}>
        <Link to={{pathname: linkDestination, search: search}}>
            <span className="content-summary-link-title align-self-center" role="img" aria-label={iconLabel}>{icon}</span>
            <span className="content-summary-link-title">{item.title}</span>
            {item.summary && <span className="small text-muted ml-2 pl-1 align-self-center d-none d-md-inline">{item.summary}</span>}
            {displayTopicTitle && <span className="small text-muted ml-2 pl-1 align-self-center d-none d-md-inline">{topicTitle}</span>}
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
