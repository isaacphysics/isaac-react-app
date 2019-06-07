import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";
import {ListGroup, ListGroupItem} from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";

export const ContentSummaryListGroupItem = ({item}: {item: ContentSummaryDTO}) => {
    let linkDestination, icon;
    let itemClasses = "p-3 pb-1 bg-transparent content-summary-link p-0 ";
    switch (item.type) {
        case (DOCUMENT_TYPE.QUESTION):
            itemClasses += "text-info";
            linkDestination = `/questions/${item.id}`;
            icon = "Q "//<span className="h-question-mark"><span>?</span></span>//"❓";
            break;
        case (DOCUMENT_TYPE.CONCEPT):
        default:
            itemClasses += "";
            linkDestination = `/concepts/${item.id}`;
            icon = "📝";
    }
    return <ListGroupItem className={itemClasses} key={linkDestination}>
        <Link to={linkDestination}>
            <span>{icon}</span>
            <span>{item.title}</span>
        </Link>
    </ListGroupItem>;
};

export const linkToContent = (item: ContentSummaryDTO) => {
    return <ContentSummaryListGroupItem item={item} key={item.type + "/" + item.id} />
};

export const LinkToContentSummaryList = ({items, ...rest}: {items: ContentSummaryDTO[];
    tag?: React.ElementType;
    flush?: boolean;
    className?: string;
    cssModule?: any;}) => {
    return <ListGroup {...rest} className="mb-3 link-list list-group-links">
        {items.map(linkToContent)}
    </ListGroup>;
};
