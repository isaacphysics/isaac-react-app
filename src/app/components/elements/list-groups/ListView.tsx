import React from "react";
import { AbstractListViewItem, AbstractListViewItemProps, AbstractListViewItemState, ListViewTagProps } from "./AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { DOCUMENT_TYPE, documentTypePathPrefix, getThemeFromContextAndTags, PATHS, SEARCH_RESULT_TYPE, siteSpecific, Subject, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import { ListGroup, ListGroupItem, ListGroupProps } from "reactstrap";
import { TitleIconProps } from "../PageTitle";
import { AffixButton } from "../AffixButton";
import { GameboardDTO, QuizSummaryDTO } from "../../../../IsaacApiTypes";
import { Link } from "react-router-dom";
import { selectors, showQuizSettingModal, useAppDispatch, useAppSelector } from "../../../state";
import classNames from "classnames";

export interface ListViewCardProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "linkTags" | "isCard"> {
    item: ShortcutResponse;
    icon?: TitleIconProps;
    subject?: Subject;
    linkTags?: ListViewTagProps[];
    state?: AbstractListViewItemState;
    url?: string;
}

export const ListViewCard = ({item, icon, subject, linkTags, state, ...rest}: ListViewCardProps) => {
    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={subject}
        subtitle={item.subtitle}
        linkTags={linkTags}
        state={state}  
        isCard
        {...rest}
    />;
};

interface QuestionListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "tags" | "supersededBy" | "subtitle" | "breadcrumb" | "status" | "url" | "audienceViews"> {
    item: ShortcutResponse;
}

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

interface ConceptListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "url"> {
    item: ShortcutResponse;
}

export const ConceptListViewItem = ({item, ...rest}: ConceptListViewItemProps) => {
    const pageSubject = useAppSelector(selectors.pageContext.subject);
    const itemSubject = getThemeFromContextAndTags(pageSubject, tags.getSubjectTags((item.tags || []) as TAG_ID[]).map(t => t.id));
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "icon-concept", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject !== "neutral" ? itemSubject : undefined}
        subtitle={item.summary}
        url={url}
        {...rest}
    />;
};

interface EventListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "url"> {
    item: ShortcutResponse;
}

export const EventListViewItem = ({item, ...rest}: EventListViewItemProps) => {
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

interface QuizListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "previewQuizIrl" | "quizButton"> {
    item: QuizSummaryDTO;
    isQuizSetter?: boolean;
    useViewQuizLink?: boolean;
}

export const QuizListViewItem = ({item, isQuizSetter, useViewQuizLink, ...rest}: QuizListViewItemProps) => {
    const dispatch = useAppDispatch();
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const quizButton = isQuizSetter ? 
        <AffixButton size="md" color={siteSpecific("solid", "primary")} onClick={() => (dispatch(showQuizSettingModal(item)))} affix={{ affix: "icon-right", position: "suffix", type: "icon" }}>
            Set test
        </AffixButton> :
        <AffixButton size="md" color={siteSpecific("solid", "primary")} to={`/${documentTypePathPrefix[DOCUMENT_TYPE.QUIZ]}/attempt/${item.id}`} tag={Link} affix={{ affix: "icon-right", position: "suffix", type: "icon" }}>
            Take the test
        </AffixButton>;

    return <AbstractListViewItem 
        icon={{type: "hex", icon: "icon-tests", size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        previewQuizUrl={useViewQuizLink ? `/test/view/${item.id}` : `/test/preview/${item.id}`}
        quizButton={useViewQuizLink ? undefined : quizButton}
        {...rest}
    />;
};

interface QuestionDeckListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "breadcrumb" | "url"> {
    item: GameboardDTO;
}

export const QuestionDeckListViewItem = ({item, ...rest}: QuestionDeckListViewItemProps) => {
    const questionTagsCountMap = item.contents?.filter(c => c.contentType === "isaacQuestionPage").map(q => q.tags as TAG_ID[]).reduce((acc, tags) => {
        tags?.forEach(tag => {
            acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
    }, {} as Record<TAG_ID, number>);

    const questionSubjects = tags.allSubjectTags.filter(s => Object.keys(questionTagsCountMap || {}).includes(s.id));
    const questionTags = Object.entries(questionTagsCountMap || {}).filter(([tagId]) => tags.allTopicTags.includes(tags.getById(tagId as TAG_ID))).sort((a, b) => b[1] - a[1]).map(([tagId]) => tagId);

    const breadcrumb = questionTags.map(tagId => tags.getById(tagId as TAG_ID)?.title).slice(0, 3);
    const url = `${PATHS.GAMEBOARD}#${item.id}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-question-deck", size: "lg"}}
        title={item.title ?? ""}
        subject={questionSubjects.length === 1 ? questionSubjects[0].id as Subject : undefined}
        breadcrumb={breadcrumb}
        url={url}
        {...rest}
    />;
};

interface QuickQuizListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "breadcrumb" | "status" | "quizTag" | "url" | "audienceViews"> {
    item: ShortcutResponse;
}

export const QuickQuizListViewItem = ({item, ...rest}: QuickQuizListViewItemProps) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `${PATHS.GAMEBOARD}#${item.id}`;

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

interface GenericListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "tags" | "supersededBy" | "breadcrumb" | "status" | "url" | "audienceViews"> {
    item: ShortcutResponse;
}

export const GenericListViewItem = ({item, ...rest}: GenericListViewItemProps) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.GENERIC]}/${item.id}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-info", size: "lg"}}
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

interface ShortcutListViewItemProps extends Omit<AbstractListViewItemProps, "icon" | "title" | "subject" | "subtitle" | "tags" | "supersededBy" | "breadcrumb" | "status" | "url" | "audienceViews"> {
    item: ShortcutResponse;
}

export const ShortcutListViewItem = ({item, ...rest}: ShortcutListViewItemProps) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `${item.url}${item.hash ? `#${item.hash}` : ""}`;

    return <AbstractListViewItem
        icon={{type: "hex", icon: "icon-concept", size: "lg"}}
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

type ListViewItemProps = 
    | Omit<ListViewCardProps, "item"> 
    | Omit<QuestionListViewItemProps, "item"> 
    | Omit<ConceptListViewItemProps, "item"> 
    | Omit<EventListViewItemProps, "item"> 
    | Omit<QuizListViewItemProps, "item"> 
    | Omit<QuestionDeckListViewItemProps, "item"> 
    | Omit<QuickQuizListViewItemProps, "item">
    | Omit<GenericListViewItemProps, "item"> 
    | Omit<ShortcutListViewItemProps, "item">;

interface ListViewProps {
    items: ShortcutResponse[];
    className?: string;
}

export const ListView = ({items, className, ...rest}: ListViewProps & ListViewItemProps) => {
    return <ListGroup className={`link-list list-group-links ${className}`}>
        {items.map((item, index) => {
            switch (item.type) {
                case (DOCUMENT_TYPE.GENERIC):
                    return <GenericListViewItem key={index} {...rest} item={item}/>;
                case (SEARCH_RESULT_TYPE.SHORTCUT):
                    return <ShortcutListViewItem key={index} {...rest} item={item}/>;
                case (DOCUMENT_TYPE.QUESTION):
                case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
                    return <QuestionListViewItem key={index} {...rest} item={item}/>;
                case (DOCUMENT_TYPE.CONCEPT):
                    return <ConceptListViewItem key={index} {...rest} item={item}/>;
                case (DOCUMENT_TYPE.EVENT):
                    return <EventListViewItem key={index} {...rest} item={item}/>;
                case (DOCUMENT_TYPE.QUIZ):
                    return <QuizListViewItem key={index} {...rest} item={item}/>;
                case SEARCH_RESULT_TYPE.GAMEBOARD:
                    return <QuestionDeckListViewItem key={index} {...rest} item={item}/>;
                default:
                    // Do not render this item if there is no matching DOCUMENT_TYPE
                    console.error("Not able to display item as a ListViewItem: ", item);
                    return null;
            }
        })}
    </ListGroup>;
};
