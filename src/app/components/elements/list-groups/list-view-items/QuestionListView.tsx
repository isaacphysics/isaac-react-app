import React from "react";
import { AbstractListViewItem } from "../AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../../services/userViewingContext";
import { DOCUMENT_TYPE, SEARCH_RESULT_TYPE, TAG_ID, tags } from "../../../../services";
import { ListGroup } from "reactstrap";

export const QuestionListViewItem = (item: ShortcutResponse) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);

    return <AbstractListViewItem 
        icon={<i className="icon-question"/> /*TODO Get actual list view icons*/}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        breadcrumb={breadcrumb} 
        status={item.state} 
        url={item.url} 
        audienceViews={audienceViews} 
    />;
};

export const ConceptListViewItem = (item: ShortcutResponse) => {
    return <AbstractListViewItem 
        icon={<i className="icon-lightbulb"/> /*TODO Get actual list view icons*/}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        url={item.url} 
    />;
};

export const EventListViewItem = (item: ShortcutResponse) => {
    return <AbstractListViewItem 
        icon={<i className="icon-lightbulb"/> /*TODO Get actual list view icons*/}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        url={item.url} 
    />;
};

export const ListView = ({items}: {items: ShortcutResponse[]}) => {

    // Cards (e.g. the subjects on the homepage)
    // Questions
    // Question Packs
    // Quick Quizzes
    // Concepts
    // Tests

    return <ListGroup className="link-list list-group-links">
        {items.map((item, index) => { 
            switch (item.type) {
                case (SEARCH_RESULT_TYPE.SHORTCUT):
                    return <QuestionListViewItem key={index} {...item}/>;
                case (DOCUMENT_TYPE.QUESTION):
                case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
                    return <QuestionListViewItem key={index} {...item}/>;
                case (DOCUMENT_TYPE.CONCEPT):
                    return <ConceptListViewItem key={index} {...item}/>;
                case (DOCUMENT_TYPE.EVENT):
                    return <EventListViewItem key={index} {...item}/>;
                case (DOCUMENT_TYPE.TOPIC_SUMMARY):
                    return <QuestionListViewItem key={index} {...item}/>;
                case (DOCUMENT_TYPE.GENERIC):
                    return <QuestionListViewItem key={index} {...item}/>;
                default:
                    // Do not render this item if there is no matching DOCUMENT_TYPE
                    console.error("Not able to display item as a ListViewItem: ", item);
                    return null;
            } 
        })}
    </ListGroup>;
};
