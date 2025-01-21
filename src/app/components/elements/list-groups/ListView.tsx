import React from "react";
import { AbstractListViewItem } from "./AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { DOCUMENT_TYPE, SEARCH_RESULT_TYPE, TAG_ID, tags } from "../../../services";
import { ListGroup } from "reactstrap";

export const QuestionListViewItem = (item: ShortcutResponse) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "list-icon-question", size: "sm"}}
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
        icon={{type: "hex", icon: "list-icon-concept", size: "sm"}}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        url={item.url} 
    />;
};

export const EventListViewItem = (item: ShortcutResponse) => {
    return <AbstractListViewItem 
        icon={{type: "hex", icon: "list-icon-concept", size: "sm"}}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        url={item.url} 
    />;
};

export const ListViewCard = () => {
    return <AbstractListViewItem 
        icon={{type: "img", icon: "/assets/phy/icons/redesign/subject-physics.svg"}}
        title={"Physics"} 
        subtitle={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus est vulputate augue  tristique, sed vehicula turpis pellentesque."} 
        url={"physics-link"}
        tags={[{tag: "11-14"}, {tag: "GCSE"}, {tag: "A-Level"}, {tag: "University"}]}
        isCard
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
