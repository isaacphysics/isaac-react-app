import React from "react";
import { AbstractListViewItem, ListViewTagProps } from "./AbstractListViewItem";
import { ShortcutResponse, Subject, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { DOCUMENT_TYPE, SEARCH_RESULT_TYPE, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import { Col, ListGroup, Row } from "reactstrap";
import { TitleIconProps } from "../PageTitle";

export const QuestionListViewItem = ({item, ...rest} : {item: ShortcutResponse}) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "list-icon-question", size: "sm"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        breadcrumb={breadcrumb}
        status={item.state}
        url={item.url}
        audienceViews={audienceViews}
        {...rest}
    />;
};

export const ConceptListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "list-icon-concept", size: "sm"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        url={item.url}
        {...rest}
    />;
};

export const EventListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "list-icon-concept", size: "sm"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        url={item.url}
        {...rest}
    />;
};

export interface ListViewCardProps {
    item: ShortcutResponse;
    icon: TitleIconProps;
    subject?: Subject;
    tagList?: ListViewTagProps[];
}

export const ListViewCard = ({item, icon, subject, tagList, ...rest}: ListViewCardProps) => {
    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={subject}
        subtitle={item.subtitle}
        tags={tagList}
        isCard
        {...rest}
    />;
};

export const ListViewCards = ({cards}: {cards: ListViewCardProps[]}) => {
    const cardGrid: JSX.Element[] = [];
    for (let i = 0; i < cards.length; i += 2) {
        if (i % 2 === 0) {
            cardGrid.push(<Row className="w-100 link-list list-group-links ms-0 border-0" key={i}>
                <Col xs={12} lg={6} className="list-view-card-border">
                    <ListViewCard {...cards[i]}/>
                </Col>
                <Col xs={12} lg={6} className="list-view-card-border">
                    <ListViewCard {...cards[i+1]}/>
                </Col>
            </Row>);
        }
    }

    return <div className="list-view-card-container">
        {cardGrid}
    </div>;
};


export const ListView = ({items, ...rest}: {items: ShortcutResponse[], fullWidth?: boolean}) => {

    // Cards (e.g. the subjects on the homepage) Xxxx
    // Questions X
    // Question Packs
    // Quick Quizzes
    // Concepts
    // Tests
    

    return <ListGroup className="link-list list-group-links">
        {items.map((item, index) => {
            switch (item.type) {
                case (SEARCH_RESULT_TYPE.SHORTCUT):
                    return <QuestionListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.QUESTION):
                case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
                    return <QuestionListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.CONCEPT):
                    return <ConceptListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.EVENT):
                    return <EventListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.TOPIC_SUMMARY):
                    return <QuestionListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.GENERIC):
                    return <QuestionListViewItem key={index} item={item} {...rest}/>;
                default:
                    // Do not render this item if there is no matching DOCUMENT_TYPE
                    console.error("Not able to display item as a ListViewItem: ", item);
                    return null;
            } 
        })}
    </ListGroup>;
};
