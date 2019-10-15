import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {DOCUMENT_TYPE, SEARCH_RESULT_TYPE} from "../../../services/constants";
import {ListGroup, ListGroupItem} from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";

export const ContentSummaryListGroupItem = ({item, search}: {item: ContentSummaryDTO; search?: string}) => {
    let linkDestination, icon, iconLabel;
    let itemClasses = "p-3 bg-transparent content-summary-link ";
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
            itemClasses += "";
            linkDestination = `/concepts/${item.id}`;
            icon = "📝";
            iconLabel = "Concept page icon";
    }
    return <ListGroupItem className={itemClasses} key={linkDestination}>
        <Link to={{pathname: linkDestination, search: search}}>
            <span className="content-summary-link-title align-self-center" role="img" aria-label={iconLabel}>{icon}</span>
            <span className="content-summary-link-title">{item.title}</span>
            {item.summary && <span className="small pt-1 pl-4 d-none d-md-inline">{item.summary}</span>}
        </Link>
    </ListGroupItem>;
};

export const linkToContent = (search: string | undefined, item: ContentSummaryDTO) => {
    return <ContentSummaryListGroupItem item={item} search={search} key={item.type + "/" + item.id} />
};

export const LinkToContentSummaryList = ({items, search, ...rest}: {
    items: ContentSummaryDTO[];
    search?: string;
    tag?: React.ElementType;
    flush?: boolean;
    className?: string;
    cssModule?: any;
}) => {
    return <ListGroup {...rest} className="mb-3 link-list list-group-links">
        {items.map(linkToContent.bind(null, search))}
    </ListGroup>;
};
