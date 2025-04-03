import React from "react";
import { AbstractListViewItem, AbstractListViewItemProps, ListViewTagProps } from "./AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { DOCUMENT_TYPE, documentTypePathPrefix, getThemeFromContextAndTags, SEARCH_RESULT_TYPE, Subject, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import { ListGroup, ListGroupItem, ListGroupItemProps, ListGroupProps } from "reactstrap";
import { TitleIconProps } from "../PageTitle";
import { AffixButton } from "../AffixButton";
import { QuizSummaryDTO } from "../../../../IsaacApiTypes";
import { Link } from "react-router-dom";
import { selectors, showQuizSettingModal, useAppDispatch, useAppSelector } from "../../../state";
import classNames from "classnames";

export interface ListViewCardProps extends ListGroupItemProps {
    item: ShortcutResponse;
    icon?: TitleIconProps;
    subject?: Subject;
    linkTags?: ListViewTagProps[];
    url?: string;
}

export const ListViewCard = ({item, icon, subject, linkTags, ...rest}: ListViewCardProps) => {
    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={subject}
        subtitle={item.subtitle}
        linkTags={linkTags}
        isCard
        {...rest}
    />;
};

type QuestionListViewItemProps = {item: ShortcutResponse} & Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "tags" | "supersededBy" | "subtitle" | "breadcrumb" | "status" | "url" | "audienceViews">;

export const QuestionListViewItem = (props : QuestionListViewItemProps) => {
    const { item, ...rest } = props;
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const pageSubject = useAppSelector(selectors.pageContext.subject);
    const itemSubject = getThemeFromContextAndTags(pageSubject, tags.getSubjectTags((item.tags || []) as TAG_ID[]).map(t => t.id));
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}`;

    return <AbstractListViewItem
        {...rest}
        icon={{type: "hex", icon: "icon-question", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject !== "neutral" ? itemSubject : undefined}
        tags={item.tags}
        supersededBy={item.supersededBy}
        subtitle={item.subtitle}
        breadcrumb={breadcrumb}
        status={item.state}
        url={url}
        audienceViews={audienceViews}
    />;
};

export const ConceptListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const pageSubject = useAppSelector(selectors.pageContext.subject);
    const itemSubject = getThemeFromContextAndTags(pageSubject, tags.getSubjectTags((item.tags || []) as TAG_ID[]).map(t => t.id));
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "icon-concept", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject !== "neutral" ? itemSubject : undefined}
        subtitle={item.subtitle}
        url={url}
        {...rest}
    />;
};

export const EventListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.EVENT]}/${item.id}`;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "icon-events", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        url={url}
        {...rest}
    />;
};

export const QuizListViewItem = ({item, isQuizSetter, ...rest}: {item: QuizSummaryDTO, isQuizSetter?: boolean}) => {
    const dispatch = useAppDispatch();
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const quizButton = isQuizSetter ? 
        <AffixButton size="md" color="solid" onClick={() => (dispatch(showQuizSettingModal(item)))} affix={{ affix: "icon-right", position: "suffix", type: "icon" }}>
            Set test
        </AffixButton> :
        <AffixButton size="md" color="solid" to={`/${documentTypePathPrefix[DOCUMENT_TYPE.QUIZ]}/${item.id}`} tag={Link} affix={{ affix: "icon-right", position: "suffix", type: "icon" }}>
            Take the test
        </AffixButton>;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "icon-tests", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        previewQuizUrl={`/test/preview/${item.id}`}
        quizButton={quizButton}
        {...rest}
    />;
};

export const QuestionDeckListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `/gameboards#${item.id}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-question-deck", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        breadcrumb={breadcrumb}
        url={url}
        {...rest}
    />;
};

export const QuickQuizListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `/gameboards#${item.id}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-question", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        breadcrumb={breadcrumb}
        status={item.state}
        quizTag={"Level 1" /* Quick quizzes are currently just gameboards. This tag doesn't exist yet in the content. */} 
        url={url}
        audienceViews={audienceViews}
        {...rest}
    />;
};

export const GenericListViewItem = ({item, ...rest}: {item: ShortcutResponse}) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-question", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.subtitle}
        tags={item.tags}
        supersededBy={item.supersededBy}
        breadcrumb={breadcrumb}
        status={item.state}
        url={url}
        audienceViews={audienceViews}
        {...rest}
    />;
};

export const ListViewCards = (props: {cards: (ListViewCardProps | null)[]} & {showBlanks?: boolean} & ListGroupProps) => {
    const { cards, showBlanks, ...rest } = props;
    return <ListGroup {...rest} className={classNames("list-view-card-container link-list list-group-links p-0 m-0 flex-row row-cols-1 row-cols-lg-2 row", rest.className)}>
        {cards.map((card, index) => card ? <ListViewCard key={index} {...card}/> : (showBlanks ? <ListGroupItem key={index}/> : null))}
    </ListGroup>;
};

export const ListView = ({items, className, ...rest}: {items: ShortcutResponse[], className?: string, fullWidth?: boolean, isQuizSetter?: boolean}) => {
    return <ListGroup className={`link-list list-group-links ${className}`}>
        {items.map((item, index) => {
            switch (item.type) {
                case (DOCUMENT_TYPE.GENERIC):
                case (SEARCH_RESULT_TYPE.SHORTCUT):
                    return <GenericListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.QUESTION):
                case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
                    return <QuestionListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.CONCEPT):
                    return <ConceptListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.EVENT):
                    return <EventListViewItem key={index} item={item} {...rest}/>;
                case (DOCUMENT_TYPE.QUIZ):
                    return <QuizListViewItem key={index} item={item} {...rest}/>;
                case SEARCH_RESULT_TYPE.GAMEBOARD:
                    return <QuestionDeckListViewItem key={index} item={item} {...rest}/>;
                default:
                    // Do not render this item if there is no matching DOCUMENT_TYPE
                    console.error("Not able to display item as a ListViewItem: ", item);
                    return null;
            }
        })}
    </ListGroup>;
};
