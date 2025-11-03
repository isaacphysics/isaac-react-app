import React from "react";
import { AbstractListViewItem, AbstractListViewItemProps } from "./AbstractListViewItem";
import { ShortcutResponse, ViewingContext } from "../../../../IsaacAppTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { BOOK_DETAIL_ID_SEPARATOR, DOCUMENT_TYPE, documentTypePathPrefix, getThemeFromContextAndTags, ISAAC_BOOKS, isAda, isPhy, PATHS, SEARCH_RESULT_TYPE, siteSpecific, Subject, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import { ListGroup, ListGroupItem, ListGroupProps } from "reactstrap";
import { AffixButton } from "../AffixButton";
import { CompletionState, ContentSummaryDTO, GameboardDTO, IsaacWildcard, QuizSummaryDTO } from "../../../../IsaacApiTypes";
import { Link } from "react-router-dom";
import { selectors, showQuizSettingModal, useAppDispatch, useAppSelector } from "../../../state";
import { UnionToIntersection } from "@reduxjs/toolkit/dist/tsHelpers";
import classNames from "classnames";
import { TitleIconProps } from "../PageTitle";

function iconPath(iconName: string): string {
    return `/assets/cs/icons/${iconName}.svg`;
} 

type ListViewCardItemProps = Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "card"}>;

export const ListViewCardItem = (props: ListViewCardItemProps) => {
    return <AbstractListViewItem
        {...props}
    />;
};

interface QuestionListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ContentSummaryDTO;
    linkedBoardId?: string;
}

export const QuestionListViewItem = (props : QuestionListViewItemProps) => {
    const { item, linkedBoardId, ...rest } = props;
    const breadcrumb = (isPhy || props.hasCaret) ? tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title) : undefined;
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const pageSubject = useAppSelector(selectors.pageContext.subject);
    const itemSubject = getThemeFromContextAndTags(pageSubject, tags.getSubjectTags((item.tags || []) as TAG_ID[]).map(t => t.id));
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}` + (linkedBoardId ? `?board=${linkedBoardId}` : "");

    const icon: TitleIconProps = isPhy
        ? {type: "hex", icon: "icon-question", size: "lg"}
        : item.state === CompletionState.IN_PROGRESS
            ? {type: "img", icon: iconPath("status-not-started"), width: "24px", height: "24px", alt: "In progress question icon"}
            : item.state === CompletionState.ALL_CORRECT
                ? {type: "img", icon: iconPath("status-correct"), width: "24px", height: "24px", alt: "Complete question icon"}
                : item.state === CompletionState.ALL_INCORRECT
                    ? {type: "img", icon: iconPath("status-incorrect"), width: "24px", height: "24px", alt: "Incorrect question icon"}
                    : {type: "img", icon: iconPath("status-not-started"), width: "24px", height: "24px", alt: "Not attempted question icon", label: "Question"};

    return <AbstractListViewItem
        {...rest}
        icon={icon}
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
    const breadcrumb = rest.hasCaret ? tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title) : undefined;
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`;

    const icon: TitleIconProps = isPhy
        ? {type: "hex", icon: "icon-concept", size: "lg"}
        : {type: "img", icon: iconPath("concept"), width: "24px", height: "24px", alt: "Concept page icon", label: "Concept"};

    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={itemSubject !== "neutral" ? itemSubject : undefined}
        subtitle={item.summary ?? item.subtitle}
        breadcrumb={breadcrumb}
        url={url}
        {...rest}
    />;
};

interface TopicListViewItemProps extends Extract<AbstractListViewItemProps, {alviType: "item", alviLayout: "list"}> {
    item: ContentSummaryDTO;
}

export const TopicListViewItem = ({item, ...rest}: TopicListViewItemProps) => {
    const pageSubject = useAppSelector(selectors.pageContext.subject);
    const itemSubject = getThemeFromContextAndTags(pageSubject, tags.getSubjectTags((item.tags || []) as TAG_ID[]).map(t => t.id));
    const breadcrumb = rest.hasCaret ? tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title) : undefined;
    const url = `/${documentTypePathPrefix[DOCUMENT_TYPE.TOPIC_SUMMARY]}/${item.id}`;
    const icon: TitleIconProps = {type: "img", icon: iconPath("topic"), width: "24px", height: "24px", alt: "Topic summary page icon", label: "Topic"};

    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={itemSubject !== "neutral" ? itemSubject : undefined}
        subtitle={item.subtitle}
        breadcrumb={breadcrumb}
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

    const icon: TitleIconProps = isPhy
        ? {type: "hex", icon: "icon-info", size: "lg"}
        : {type: "img", icon: iconPath("info-filled"), width: "24px", height: "24px", alt: "Generic page icon", label: "Info"};

    return <AbstractListViewItem
        icon={icon}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={item.summary ?? item.subtitle}  // summary more useful than subtitle, if present.
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
    linkedBoardId?: string;
}

export const ShortcutListViewItem = ({item, linkedBoardId, ...rest}: ShortcutListViewItemProps) => {
    const breadcrumb = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title);
    const audienceViews: ViewingContext[] = determineAudienceViews(item.audience);
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[])?.id as Subject;
    const url = `${item.url}${linkedBoardId ? `?board=${linkedBoardId}` : ""}${item.hash ? `#${item.hash}` : ""}`;
    const icon = (url.includes("concepts/") || !item.className?.includes("wildcard-list-view")) ? "icon-concept" : "icon-wildcard";
    const subtitle = (item as IsaacWildcard).description ?? item.summary ?? item.subtitle;

    return <AbstractListViewItem
        icon={{type: "hex", icon: icon, size: "lg"}}
        title={item.title ?? ""}
        subject={itemSubject}
        subtitle={subtitle}
        tags={item.tags}
        supersededBy={item.supersededBy}
        breadcrumb={breadcrumb}
        status={item.state}
        url={url}
        audienceViews={audienceViews}
        className={item.className}
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

    return <AbstractListViewItem
        {...item}
        icon={{type: "hex", icon: "icon-generic", size: "lg"}}
        title={`${item.subtitle ? (item.subtitle + " ") : ""}${item.title}`}
        subtitle={itemBook?.title}
        url={itemBook ? `/${documentTypePathPrefix[DOCUMENT_TYPE.BOOK_INDEX_PAGE]}/${item.id?.replace(BOOK_DETAIL_ID_SEPARATOR, "/").slice("book_".length)}` : undefined}
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
    hasCaret?: boolean;
} & (
    {
        items: Required<T> extends Required<Extract<ListViewItemProps, {alviType: G}>['item']> ? T[] : never;
        type: G;
    }
    & Omit<UnionToIntersection<Extract<ListViewItemProps, {alviType: G}>>, "item" | keyof AbstractListViewItemProps>
)

// ListView type system in excessive detail:
//   ListView is a wrapper component for rendering a group of various types of ListViewItems. The idea is that ListView is always the component you want when
//   building anything; there is no need to know the details of which ListViewItem is being rendered. You merely provide the "type" of ListView, the "layout"
//   (i.e. list / cards), and then pass in the items you want to render.

//   The different types exist to allow the underlying AbstractListViewItem to render different types of item. The most common type is "item", used for questions,
//   concepts, search results... – these have titles, subtitles, tags, and a url (e.g. ContentSummaryDTOs, ShortcutResponses). The other types are "gameboard",
//   which have exclusive "Assign" buttons for teachers, and "quiz", which have exclusive "Preview" and "Take quiz" buttons.

//   On to the typing. ListView has two generic types, T and G, which should not be specified directly in a component – if TS can infer them, you're using it
//   right. T is the type of the items being passed in; G is the type of ListView being rendered ("item" | "gameboard" | "quiz").

//   In order to ensure that the items being passed in are valid under the context of type G, T is not immediately inferred from the items prop. Instead, it is
//   checked against the union of all possible ListViewItem prop types, provided that ListViewItem is of the type G. The items prop is valid if its type extends
//   the type of any single ListViewItem type of type G. We use `Required` as most of these types (e.g. ContentSummaryDTO) are fully optional by nature.

//   The second part of the type system is the {...rest} props. These are props that can be passed to an individual ListViewItem type; for example, a
//   QuestionListViewItem can have a `linkedBoardId` prop, which is not present on a ConceptListViewItem. In a ListView where this is prop is set
//   (<ListView type="item" linkedBoardId="123" items={...} />), all question items will have the `linkedBoardId` prop passed to them. The prop is ignored on
//   other item types.

//   These type of {...rest} props is calculated similarly to the items prop. However, with items, we wanted validity to be checked entirely against a single
//   ListViewItem type. Here, we want to allow props that are valid on any ListViewItem of type G, even if they are not valid on another. As such, we need convert
//   the union of all ListViewItem types of type G into an intersection, as to obtain all props for that type.

export const ListView = <T extends {type?: string}, G extends "item" | "gameboard" | "quiz">(props: ListViewProps<T, G>) => {
    const {items, className, type, ...rest} = props;

    const failedToRender = (item: typeof items[number]) => {
        // Do not render an item if there is no matching DOCUMENT_TYPE
        console.error("Not able to display item as a ListViewItem: ", item);
        return null;
    };

    return <ListGroup className={classNames("link-list list-group-links", className)}>
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
                            case (DOCUMENT_TYPE.TOPIC_SUMMARY):
                                return <TopicListViewItem key={index} {...rest} item={item} alviType={type} alviLayout="list"/>;
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
