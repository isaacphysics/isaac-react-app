import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";
import {ListGroup, ListGroupItem} from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";

export const ContentSummaryListGroupItem = ({item}: {item: ContentSummaryDTO}) => {
    let linkDestination, icon;
    let itemClasses = "content-summary-link p-0 ";
    switch (item.type) {
        case (DOCUMENT_TYPE.QUESTION):
            itemClasses += "text-info";
            linkDestination = `/questions/${item.id}`;
            icon = "❓";
            break;
        case (DOCUMENT_TYPE.CONCEPT):
        default:
            itemClasses += "";
            linkDestination = `/concepts/${item.id}`;
            icon = "📝";
    }
    return <ListGroupItem className={itemClasses} key={linkDestination}>
        <Link to={linkDestination}>
            <ListGroup tag="div" className="list-group-horizontal">
                <ListGroupItem tag="span">{icon}</ListGroupItem>
                <ListGroupItem tag="span" className="w-100">{item.title}</ListGroupItem>
                <ListGroupItem tag="span" className="float-right">&gt;</ListGroupItem>
            </ListGroup>
        </Link>
    </ListGroupItem>;
};

export const linkToContent = (item: ContentSummaryDTO) => {
    return <ContentSummaryListGroupItem item={item} key={item.type + "/" + item.id} />
};

export const LinkToContentSummaryList = ({items, ...rest}: {items: ContentSummaryDTO[];
    tag?: () => string|string;
    flush?: boolean;
    className?: string;
    cssModule?: any;}) => {
    return <ListGroup {...rest}>
        {items.map(linkToContent)}
    </ListGroup>;
};