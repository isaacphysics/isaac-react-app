import React from "react";
import { AbstractListViewItem } from "../AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../../services/userViewingContext";
import { TAG_ID, tags } from "../../../../services";
import { ListGroup } from "reactstrap";

export const QuestionListViewItem = (item: ShortcutResponse) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);

    return <AbstractListViewItem 
        icon={<i className="icon-question"/> /*TODO Create actual list view icons*/}
        title={item.title ?? ""} 
        subtitle={item.subtitle} 
        breadcrumb={breadcrumb} 
        status={item.state} 
        url={item.url} 
        audienceViews={audienceViews} 
    />;
};

export const QuestionListView = ({items}: {items: ShortcutResponse[]}) => {
    return <ListGroup className="link-list list-group-links">
        {items.map((item, index) => <QuestionListViewItem key={index} {...item}/>)}
    </ListGroup>;
}
