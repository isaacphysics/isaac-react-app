import { Link } from "react-router-dom";
import React, { HTMLAttributes, ReactNode, useMemo } from "react";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { ViewingContext} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { Button, Col, ListGroupItem, ListGroupItemProps } from "reactstrap";
import { CompletionState, GameboardDTO } from "../../../../IsaacApiTypes";
import { below, isDefined, isPhy, isTeacherOrAbove, siteSpecific, Subject, useDeviceSize } from "../../../services";
import { PhyHexIcon } from "../svg/PhyHexIcon";
import { TitleIconProps } from "../PageTitle";
import { Markup } from "../markup";
import { closeActiveModal, openActiveModal, selectors, useAppDispatch, useAppSelector, useGetGroupsQuery, useGetMySetAssignmentsQuery, useUnassignGameboardMutation } from "../../../state";
import { getAssigneesByBoard, SetAssignmentsModal } from "../../pages/SetAssignments";

const Breadcrumb = ({breadcrumb}: {breadcrumb: string[]}) => {
    return <>
        {breadcrumb.map(b => <span className="hierarchy-tag" key={b}>{b}</span>)}
    </>;
};

interface StatusDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: CompletionState;
    showText?: boolean;
}

const StatusDisplay = (props: StatusDisplayProps) => {
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
        case CompletionState.NOT_ATTEMPTED:
            return;
    }
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
        {previewQuizUrl && <Button to={previewQuizUrl} color={siteSpecific("keyline", "secondary")} tag={Link} className="set-quiz-button-md">
            {previewQuizUrl.includes("/preview/") ? "Preview" : "View test"}
        </Button>}
        {quizButton}
    </span>;
};

export enum AbstractListViewItemState {
    COMING_SOON = "coming-soon",
    DISABLED = "disabled",
}

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
} & (
    // ALVI types
    {
        // most ALVIs, represents plain lists with optional difficulties; questions, concepts, books, etc.
        alviType: "item";
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
    }
) & (
    // ALVI layouts
    {
        alviLayout: "card"
        linkTags?: ListViewTagProps[];
    } | {
        alviLayout: "list";
    }
);

export const AbstractListViewItem = ({title, icon, subject, subtitle, breadcrumb, tags, fullWidth, url, state, className, ...typedProps}: AbstractListViewItemProps) => { 
    const deviceSize = useDeviceSize();
    const user = useAppSelector(selectors.user.orNull);

    const isItem = typedProps.alviType === "item";
    const isGameboard = typedProps.alviType === "gameboard";
    const isQuiz = typedProps.alviType === "quiz";
    const isCard = typedProps.alviLayout === "card";
    const isDisabled = state && [AbstractListViewItemState.COMING_SOON, AbstractListViewItemState.DISABLED].includes(state);
    
    fullWidth = fullWidth || below["sm"](deviceSize) || (isItem && !(typedProps.status || typedProps.audienceViews));
    const cardBody =
    <div className="w-100 d-flex flex-row">
        <Col className={classNames("d-flex flex-grow-1", {"mt-3": isCard && typedProps.linkTags?.length, "mb-3": isCard && !typedProps.linkTags?.length})}>
            <div className="position-relative">
                {icon && (
                    icon.type === "img" ? <img src={icon.icon} alt="" className="me-3"/> 
                        : icon.type === "hex" ? <PhyHexIcon icon={icon.icon} subject={icon.subject} size={icon.size}/>
                            : icon.type === "placeholder" ? <div style={{width: icon.width, height: icon.height}}/> 
                                : undefined
                )}
                {isItem && typedProps.status && typedProps.status === CompletionState.ALL_CORRECT && <div className="list-view-status-indicator">
                    <StatusDisplay status={typedProps.status} showText={false} />
                </div>}
            </div>
            <div className="align-content-center text-overflow-ellipsis pe-2">
                <div className="d-flex text-wrap">
                    <span className={classNames("link-title", {"question-link-title": isPhy || !isQuiz})}><Markup encoding="latex">{title}</Markup></span>
                    {isItem && <>
                        {typedProps.quizTag && <span className="quiz-level-1-tag ms-sm-2">{typedProps.quizTag}</span>}
                        {isPhy && <div className="d-flex flex-column justify-self-end">
                            {typedProps.supersededBy && <a 
                                className="superseded-tag mx-1 ms-sm-3 align-self-end" 
                                href={`/questions/${typedProps.supersededBy}`}
                                onClick={(e) => e.stopPropagation()}
                            >SUPERSEDED</a>}
                            {tags?.includes("nofilter") && <span
                                className="superseded-tag mx-1 ms-sm-3 align-self-end" 
                            >NO-FILTER</span>}
                        </div>}
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
                {isItem && fullWidth && typedProps.status && typedProps.status !== CompletionState.ALL_CORRECT &&
                    <StatusDisplay status={typedProps.status} showText className="py-1" />
                }
                {linkTags && <div className="d-flex py-3 flex-wrap">
                    <LinkTags linkTags={linkTags}/>
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
                {isItem && typedProps.status && typedProps.status !== CompletionState.ALL_CORRECT && <StatusDisplay status={typedProps.status} showText className="ms-2 me-3" />}
                {isItem && typedProps.audienceViews && <div className={classNames("d-none d-md-flex justify-content-end wf-13", {"list-view-border": typedProps.audienceViews.length > 0})}>
                    <StageAndDifficultySummaryIcons audienceViews={typedProps.audienceViews} stack className="w-100"/> 
                </div>}
                {isQuiz && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                    <QuizLinks previewQuizUrl={typedProps.previewQuizUrl} quizButton={typedProps.quizButton}/> 
                </Col>}
            </>
        }
    </div>;

    return <ListGroupItem
        className={classNames("content-summary-item", {"correct": isItem && typedProps.status === CompletionState.ALL_CORRECT}, className, state)} 
        data-bs-theme={subject && !isDisabled ? subject : "neutral"}
    >
        {url && !isDisabled
            ? <Link to={url} className="w-100 h-100 align-items-start"> {cardBody} </Link> 
            : cardBody
        }
    </ListGroupItem>;
};
