import { Link } from "react-router-dom";
import React, { HTMLAttributes, ReactNode } from "react";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { ViewingContext} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { Badge, Button, Col, ListGroupItem } from "reactstrap";
import { CompletionState, GameboardDTO } from "../../../../IsaacApiTypes";
import { above, below, isAda, isDefined, isPhy, isStaff, isTeacherOrAbove, siteSpecific, Subject, useDeviceSize } from "../../../services";
import { TitleIcon, TitleIconProps } from "../PageTitle";
import { Markup } from "../markup";
import { closeActiveModal, openActiveModal, selectors, useAppDispatch, useAppSelector, useLazyGetGroupsQuery, useLazyGetMySetAssignmentsQuery, useUnassignGameboardMutation } from "../../../state";
import { getAssigneesByBoard } from "../../pages/SetAssignments";
import { SetAssignmentsModal } from "../modals/SetAssignmentsModal";
import { ExternalLink } from "../ExternalLink";
import { QuestionPropertyTags } from "../ContentPropertyTags";
import { LLMFreeTextQuestionIndicator } from "../LLMFreeTextQuestionIndicator";
import { CrossTopicQuestionIndicator } from "../CrossTopicQuestionIndicator";
import { SupersededDeprecatedBoardContentWarning } from "../../navigation/SupersededDeprecatedWarning";

const Breadcrumb = ({breadcrumb}: {breadcrumb: string[]}) => {
    return <>
        {breadcrumb.map(b => <span className="hierarchy-tag" key={b}>{b}</span>)}
    </>;
};

interface StatusDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: CompletionState;
    showText?: boolean;
}

export const StatusDisplay = (props: StatusDisplayProps) => {
    const { status, showText, className, ...rest } = props;
    switch (status) {
        case CompletionState.IN_PROGRESS:
            return <span {...rest} className={classNames("d-flex gap-2 status-tag align-items-center", className)}>
                <i className="icon icon-raw icon-in-progress" />
                {showText && "In progress"}
            </span>;
        case CompletionState.ALL_CORRECT:
            return <span {...rest} className={classNames("d-flex gap-2 status-tag align-items-center", className)}>
                <i className="icon icon-raw icon-correct" />
                {showText && "Correct"}
            </span>;
        case CompletionState.ALL_INCORRECT:
        case CompletionState.ALL_ATTEMPTED:
            return <span {...rest} className={classNames("d-flex gap-2 status-tag align-items-center", className)}>
                <i className="icon icon-raw icon-attempted" />
                {showText && "Attempted"}
            </span>;
        case CompletionState.NOT_ATTEMPTED:
            return;
    }
};

interface ItemCountProps extends React.HTMLAttributes<HTMLSpanElement> {
    count: number;
}

const ItemCount = ({count, ...rest}: ItemCountProps) => {
    return <Badge color="theme" {...rest} className={classNames("list-view-status-indicator count-tag", rest.className)}>
        {count < 100 ? count : "99+"}
    </Badge>;
};

export interface ListViewTagProps extends HTMLAttributes<HTMLElement> {
    tag: string;
    url?: string;
}

export interface LinkTagProps {
    linkTags: ListViewTagProps[];
    disabled?: boolean;
}

const LinkTags = ({linkTags, disabled}: LinkTagProps) => {
    return <>
        {linkTags.map(t => {
            const {url, tag, ...rest} = t;
            return url && !disabled ?
                <Link {...rest} to={url} className="card-tag" key={tag}>{tag}</Link> :
                <div {...rest} className={classNames("card-tag", {"disabled": disabled})} key={tag}>{tag}</div>;
        })}
    </>;
};

const QuizLinks = (props: React.HTMLAttributes<HTMLSpanElement> & {previewQuizUrl?: string, quizButton?: ReactNode}) => {
    const { previewQuizUrl, quizButton, ...rest } = props;
    return <span {...rest} className={classNames(rest.className, "d-flex justify-content-end gap-3")}>
        {previewQuizUrl && <Button to={previewQuizUrl} color={siteSpecific("keyline", "solid")} tag={Link} className="set-quiz-button-md">
            {previewQuizUrl.includes("/preview/") ? "Preview" : "View test"}
        </Button>}
        {quizButton}
    </span>;
};

const GameboardAssign = ({board}: {board?: GameboardDTO}) => {
    const dispatch = useAppDispatch();
    const [ getGroups ] = useLazyGetGroupsQuery();
    const [ getAssignments ] = useLazyGetMySetAssignmentsQuery();
    const [ unassignBoard ] = useUnassignGameboardMutation();

    return <Button color="solid" 
        onClick={async (e) => {
            e.stopPropagation();
            const {data: groups} = await getGroups(false, true);
            const {data: assignmentsSetByMe} = await getAssignments(undefined, true);
            const groupsByGameboard = getAssigneesByBoard(assignmentsSetByMe);
            
            dispatch(openActiveModal(SetAssignmentsModal({
                board,
                groups: groups ?? [],
                assignees: (isDefined(board) && isDefined(board?.id) && groupsByGameboard[board.id]) || [],
                toggle: () => dispatch(closeActiveModal()),
                unassignBoard
            })));
        }}
    >
        Assign
    </Button>;
};

export enum AbstractListViewItemState {
    COMING_SOON = "coming-soon",
    DISABLED = "disabled",
}

type ALVIType = {
    // most ALVIs, represents plain lists with optional difficulties; questions, concepts, books, etc.
    alviType: "item";
    deprecated?: boolean;
    supersededBy?: string;
    audienceViews?: ViewingContext[];
    status?: CompletionState;
    quizTag?: string; // this is for quick quizzes only, which are currently just gameboards; may change in future
} | {
    // quizzes – have exclusive "preview" and "view test" buttons
    alviType: "quiz";
    previewQuizUrl?: string;
    quizButton?: JSX.Element;
    audienceViews?: ViewingContext[];
    status?: CompletionState;
} | {
    // gameboards – have exclusive "assign" buttons
    alviType: "gameboard";
    board?: GameboardDTO;
};

type ALVILayout = {
    alviLayout: "card"
    linkTags?: ListViewTagProps[];
} | {
    alviLayout: "list";
};

export type AbstractListViewItemProps = {
    title?: string;
    icon?: TitleIconProps;
    subject?: Subject;
    subtitle?: string;
    breadcrumb?: string[];
    tags?: string[];
    fullWidth?: boolean;
    url?: string;
    state?: AbstractListViewItemState;
    className?: string;
    hasCaret?: boolean;
} & ALVIType & ALVILayout;

export const AbstractListViewItem = ({title, icon, subject, subtitle, breadcrumb, tags, fullWidth, url, state, className, hasCaret, ...typedProps}: AbstractListViewItemProps) => { 
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);

    const isItem = typedProps.alviType === "item";
    const isGameboard = typedProps.alviType === "gameboard";
    const isQuiz = typedProps.alviType === "quiz";
    const isCard = typedProps.alviLayout === "card";
    const isDisabled = state && [AbstractListViewItemState.COMING_SOON, AbstractListViewItemState.DISABLED].includes(state);

    const isCrossTopic = isAda && tags?.includes("cross_topic");
    const isLLM = tags?.includes("llm_question_page");

    fullWidth = fullWidth || below["sm"](deviceSize) || (isItem && !(typedProps.status || typedProps.audienceViews));
    const cardBody = <>
        <div className="w-100 d-flex flex-row">
            <Col className={classNames("d-flex flex-grow-1", {"mt-3": isCard, "mb-3": isCard && !typedProps.linkTags?.length})}>
                <div className={classNames("position-relative", {"question-progress-icon": isAda})}>
                    {icon && <div className="inner-progress-icon">
                        <TitleIcon icon={icon} />
                        {icon.label && isAda && above['sm'](deviceSize) && <div className="icon-title mt-1">{icon.label}</div>}
                    </div>}
                    {isPhy && isItem && typedProps.status && typedProps.status === CompletionState.ALL_CORRECT && <div className="list-view-status-indicator">
                        <StatusDisplay status={typedProps.status} showText={false} />
                    </div>}
                    {isGameboard && typedProps.board?.contents && <ItemCount count={typedProps.board.contents.length} />}
                </div>
                <div className={classNames("align-content-center text-overflow-ellipsis", siteSpecific("pe-2", "py-3"))}>
                    <div className="d-flex text-wrap mt-n1">
                        {url && !isDisabled
                            ? (url.startsWith("http")
                                ? <ExternalLink href={url} className={classNames("alvi-title", {"question-link-title": isPhy || !isQuiz})}>
                                    <Markup encoding="latex">{title}</Markup>
                                </ExternalLink>
                                : <Link to={url} className={classNames("alvi-title", {"question-link-title": isPhy || !isQuiz})}>
                                    <Markup encoding="latex">{title}</Markup>
                                </Link>
                            )
                            : <span className={classNames("alvi-title", {"question-link-title": isPhy || !isQuiz})}>
                                <Markup encoding="latex">{title}</Markup>
                            </span>
                        }
                        {isItem && <>
                            {typedProps.quizTag && <span className="quiz-level-1-tag ms-sm-2">{typedProps.quizTag}</span>}
                            <QuestionPropertyTags className="ms-2 justify-self-end" deprecated={typedProps.deprecated} supersededBy={typedProps.supersededBy} tags={tags} />
                        </>}
                    </div>
                    {subtitle && <div className="small text-muted text-wrap">
                        <Markup encoding="latex">{subtitle}</Markup>
                    </div>}
                    {breadcrumb && <span className="hierarchy-tags d-flex flex-wrap mw-auto">
                        <Breadcrumb breadcrumb={breadcrumb}/>
                    </span>}
                    {isItem && fullWidth && typedProps.audienceViews && <div className="d-flex mt-1"> 
                        <StageAndDifficultySummaryIcons audienceViews={typedProps.audienceViews} stack/> 
                    </div>}
                    {(isCrossTopic || isLLM) && <div className={classNames("d-flex flex-wrap gap-2 mt-1", {"mt-2": isPhy || !fullWidth})}>
                        {isCrossTopic && <CrossTopicQuestionIndicator small />}
                        {isLLM && <LLMFreeTextQuestionIndicator small />}
                    </div>}
                    {isPhy && isItem && fullWidth && typedProps.status && typedProps.status !== CompletionState.ALL_CORRECT &&
                        <StatusDisplay status={typedProps.status} showText className="py-1" />
                    }
                    {isGameboard && fullWidth && isTeacherOrAbove(user) && <div className="d-flex pt-3">
                        <GameboardAssign board={typedProps.board} />
                    </div>}
                    {isCard && typedProps.linkTags && <div className="d-flex py-3 flex-wrap">
                        <LinkTags linkTags={typedProps.linkTags}/>
                    </div>}
                    {isQuiz && fullWidth && <div className="d-flex d-md-none align-items-center">
                        <QuizLinks previewQuizUrl={typedProps.previewQuizUrl} quizButton={typedProps.quizButton}/>
                    </div>}
                </div>
            </Col>
            {!fullWidth &&
                <>
                    {isPhy && isItem && typedProps.status && typedProps.status !== CompletionState.ALL_CORRECT && <StatusDisplay status={typedProps.status} showText className="ms-2 me-3" />}
                    {isItem && typedProps.audienceViews && <div className={classNames("d-none d-md-flex justify-content-end wf-13", {"list-view-border": typedProps.audienceViews.length > 0})}>
                        <StageAndDifficultySummaryIcons audienceViews={typedProps.audienceViews} stack className={siteSpecific("w-100", "py-3 pe-3")}/> 
                    </div>}
                    {isGameboard && isTeacherOrAbove(user) && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                        <GameboardAssign board={typedProps.board} />
                    </Col>}
                    {isQuiz && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                        <QuizLinks previewQuizUrl={typedProps.previewQuizUrl} quizButton={typedProps.quizButton}/> 
                    </Col>}
                </>
            }
            {hasCaret && <div className="list-caret align-content-center" aria-hidden="true">
                <i className="icon icon-chevron-right" aria-hidden="true"/>
            </div>}
        </div>
        {isGameboard && isStaff(user) && <SupersededDeprecatedBoardContentWarning hideFullDetails gameboard={typedProps.board} className="mt-4" />}
    </>;

    return <ListGroupItem
        className={classNames("content-summary-item", {"correct": isItem && typedProps.status === CompletionState.ALL_CORRECT}, className, state)} 
        data-bs-theme={subject && !isDisabled ? subject : "neutral"}
        data-testid={"list-view-item"}
    >
        {cardBody}
    </ListGroupItem>;
};
