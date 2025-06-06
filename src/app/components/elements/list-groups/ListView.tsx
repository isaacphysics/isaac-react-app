import React from "react";
import { AbstractListViewItem, AbstractListViewItemProps } from "./AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { DOCUMENT_TYPE, documentTypePathPrefix, getThemeFromContextAndTags, ISAAC_BOOKS, PATHS, SEARCH_RESULT_TYPE, siteSpecific, Subject, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import { ListGroup, ListGroupItem, ListGroupProps } from "reactstrap";
import { AffixButton } from "../AffixButton";
import { ContentSummaryDTO, GameboardDTO, QuizSummaryDTO } from "../../../../IsaacApiTypes";
import { Link } from "react-router-dom";
import { selectors, showQuizSettingModal, useAppDispatch, useAppSelector } from "../../../state";
import classNames from "classnames";

type ListViewCardItemProps = Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "card"}>;

export const ListViewCardItem = (props: ListViewCardItemProps) => {
    return <AbstractListViewItem 
        {...props}
    />;
};

interface QuestionListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ContentSummaryDTO;
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

interface ConceptListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ContentSummaryDTO;
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

interface EventListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
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

interface QuizListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "quiz", alviLayout: "list"}> {
    item: QuizSummaryDTO;
    isQuizSetter?: boolean;
    useViewQuizLink?: boolean;
}

export const QuizListViewItem = ({item, isQuizSetter, useViewQuizLink, ...rest}: QuizListViewItemProps) => {
    const dispatch = useAppDispatch();
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const quizButton = isQuizSetter ? 
        <AffixButton size="md" color="solid" onClick={() => (dispatch(showQuizSettingModal(item)))} affix={{ affix: "icon-arrow-right", position: "suffix", type: "icon" }}>
            Set test
        </AffixButton> :
        <AffixButton size="md" color="solid" to={`/${documentTypePathPrefix[DOCUMENT_TYPE.QUIZ]}/attempt/${item.id}`} tag={Link} affix={{ affix: "icon-arrow-right", position: "suffix", type: "icon" }}>
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

type ALVIGameboard = GameboardDTO & {type?: string};

export const convertToALVIGameboard = (gameboard: GameboardDTO): ALVIGameboard => {
    return {...gameboard, type: SEARCH_RESULT_TYPE.GAMEBOARD};
};
export const convertToALVIGameboards = (gameboards: GameboardDTO[]): ALVIGameboard[] => {
    return gameboards.map(convertToALVIGameboard);
};
interface QuestionDeckListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "gameboard", alviLayout: "list"}> {
    item: ALVIGameboard;
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
        title={item.title ?? "no title"}
        subject={questionSubjects.length === 1 ? questionSubjects[0].id as Subject : undefined}
        breadcrumb={breadcrumb}
        url={url}
        board={item}
        {...rest}
    />;
};

interface QuickQuizListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
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

interface GenericListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
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

interface ShortcutListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
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

interface BookIndexListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ShortcutResponse;
}

export const BookIndexListViewItem = ({item, ...rest}: BookIndexListViewItemProps) => {
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;

    return <AbstractListViewItem
        {...item}
        icon={{type: "hex", icon: "icon-book", size: "lg"}}
        url={`/${documentTypePathPrefix[DOCUMENT_TYPE.BOOK_INDEX_PAGE]}/${item.id?.slice("book_".length)}`}
        subject={itemSubject}
        state={undefined}
        {...rest}
    />;
};

interface BookDetailListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ShortcutResponse;
}

export const BookDetailListViewItem = ({item, ...rest}: BookDetailListViewItemProps) => {
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const itemBook = ISAAC_BOOKS.find((book) => item.tags?.includes(book.tag));
    const itemLabel = itemBook ? item.id?.slice(`book_${itemBook.tag}_`.length) : undefined;

    return <AbstractListViewItem
        {...item}
        icon={{type: "hex", icon: "icon-generic", size: "lg"}}
        title={`${itemLabel ? (itemLabel?.toUpperCase() + " ") : ""}${item.title}`}
        subtitle={itemBook?.title}
        url={itemBook ? `/${documentTypePathPrefix[DOCUMENT_TYPE.BOOK_INDEX_PAGE]}/${itemBook.tag}/${itemLabel}` : undefined}
        subject={itemSubject}
        state={undefined}
        {...rest}
    />;
};

export type ListViewCardProps = Omit<Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "card"}>, "alviType" | "alviLayout">;

export const ListViewCards = (props: {cards: (ListViewCardProps | null)[]} & {showBlanks?: boolean} & ListGroupProps) => {
    const { cards, showBlanks, ...rest } = props;
    return <ListGroup {...rest} className={classNames("list-view-card-container link-list list-group-links p-0 m-0 flex-row row-cols-1 row-cols-lg-2 row", rest.className)}>
        {cards.map((card, index) => card ? <ListViewCardItem {...card} key={index} alviType="item" alviLayout="card"/> : (showBlanks ? <ListGroupItem key={index}/> : null))}
    </ListGroup>;
};

type ListViewItemProps = 
    | QuestionListViewItemProps
    | ConceptListViewItemProps
    | EventListViewItemProps
    | QuizListViewItemProps
    | QuestionDeckListViewItemProps
    | QuickQuizListViewItemProps
    | GenericListViewItemProps
    | ShortcutListViewItemProps
    | BookIndexListViewItemProps
    | BookDetailListViewItemProps;

type ListViewProps<T, G extends "item" | "gameboard" | "quiz"> = {
    className?: string;
    fullWidth?: boolean;
} & (
    {
        items: Required<T> extends Required<Extract<ListViewItemProps, {alviType: G}>['item']> ? T[] : never;
        type: G;
    } 
    & Omit<Extract<ListViewItemProps, {alviType: G}>, "item" | keyof AbstractListViewItemProps>
);

export const ListView = <T extends {type?: string}, G extends "item" | "gameboard" | "quiz">(props: ListViewProps<T, G>) => {
    const {items, className, type, ...rest} = props;

    const failedToRender = (item: typeof items[number]) => {
        // Do not render an item if there is no matching DOCUMENT_TYPE
        console.error("Not able to display item as a ListViewItem: ", item);
        return null;
    };

    return <ListGroup className={`link-list list-group-links ${className}`}>
        {(() => {
            switch (type) {
                case "item":
                    return items.map((item, index) => {
                        switch (item.type) {
                            case (DOCUMENT_TYPE.GENERIC):
                                return <GenericListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case (SEARCH_RESULT_TYPE.SHORTCUT):
                                return <ShortcutListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case (DOCUMENT_TYPE.QUESTION):
                            case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
                                return <QuestionListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case (DOCUMENT_TYPE.CONCEPT):
                                return <ConceptListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case (DOCUMENT_TYPE.EVENT):
                                return <EventListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case DOCUMENT_TYPE.BOOK_INDEX_PAGE:
                                return <BookIndexListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            case SEARCH_RESULT_TYPE.BOOK_DETAIL_PAGE:
                                return <BookDetailListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            default:
                                return failedToRender(item);
                        }
                    });
                case "gameboard":
                    return items.map((item, index) => {
                        switch (item.type) {
                            case SEARCH_RESULT_TYPE.GAMEBOARD:
                                return <QuestionDeckListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            default:
                                return failedToRender(item);
                        }
                    });
                case "quiz":
                    return items.map((item, index) => {
                        switch (item.type) {
                            case (DOCUMENT_TYPE.QUIZ):
                                return <QuizListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
                            default:
                                return failedToRender(item);
                        }
                    });
                default:
                    return null;
            }
        })()}
    </ListGroup>;
};
