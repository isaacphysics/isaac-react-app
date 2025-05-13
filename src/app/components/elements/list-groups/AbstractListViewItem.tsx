import { Link } from "react-router-dom";
import React, { HTMLAttributes, ReactNode } from "react";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { ViewingContext} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { Button, Col, ListGroupItem, ListGroupItemProps } from "reactstrap";
import { CompletionState } from "../../../../IsaacApiTypes";
import { below, isPhy, siteSpecific, Subject, useDeviceSize } from "../../../services";
import { PhyHexIcon } from "../svg/PhyHexIcon";
import { TitleIconProps } from "../PageTitle";
import { Markup } from "../markup";

const Breadcrumb = ({breadcrumb}: {breadcrumb: string[]}) => {
    return <>
        {breadcrumb.map(b => <span className="hierarchy-tag" key={b}>{b}</span>)}
    </>;
};

const StatusDisplay = (props: React.HTMLAttributes<HTMLSpanElement> & {status: CompletionState}) => {
    const { status, ...rest } = props;
    switch (status) {
        case CompletionState.IN_PROGRESS:
            return <span {...rest} className={classNames(rest.className, "status-tag d-flex align-items-center")}>
                <img className="pe-2" src={`/assets/phy/icons/redesign/status-in-progress.svg`} alt=""/>
                In progress
            </span>;
        case CompletionState.ALL_CORRECT:
            return <span {...rest} className={classNames(rest.className, "status-tag d-flex align-items-center")}>
                <img className="pe-2" src={`/assets/phy/icons/redesign/status-correct.svg`} alt=""/>
                Correct
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

export interface AbstractListViewItemProps extends ListGroupItemProps {
    title?: string;
    icon?: TitleIconProps;
    subject?: Subject;
    subtitle?: string;
    breadcrumb?: string[];
    status?: CompletionState;
    tags?: string[];
    supersededBy?: string;
    linkTags?: ListViewTagProps[];
    quizTag?: string;
    url?: string;
    audienceViews?: ViewingContext[];
    previewQuizUrl?: string;
    quizButton?: JSX.Element;
    isCard?: boolean;
    fullWidth?: boolean;
    state?: AbstractListViewItemState;
}

export const AbstractListViewItem = ({icon, title, subject, subtitle, breadcrumb, status, tags, supersededBy, linkTags, quizTag, url, audienceViews, previewQuizUrl, quizButton, isCard, fullWidth, state, ...rest}: AbstractListViewItemProps) => { 
    const deviceSize = useDeviceSize();
    const isQuiz: boolean = !!(previewQuizUrl || quizButton);
    const isDisabled = state && [AbstractListViewItemState.COMING_SOON, AbstractListViewItemState.DISABLED].includes(state);
    
    fullWidth = fullWidth || below["sm"](deviceSize) || ((status || audienceViews || previewQuizUrl || quizButton) ? false : true);
    const cardBody =
    <div className="w-100 d-flex flex-row">
        <Col className={classNames("d-flex flex-grow-1", {"mt-3": isCard && linkTags?.length, "mb-3": isCard && !linkTags?.length})}>
            <div>
                {icon && (
                    icon.type === "img" ? <img src={icon.icon} alt="" className="me-3"/> 
                        : icon.type === "hex" ? <PhyHexIcon icon={icon.icon} subject={icon.subject} size={icon.size}/> : undefined)}
            </div>
            <div className="align-content-center text-overflow-ellipsis pe-2">
                <div className="d-flex text-wrap">
                    <span className={classNames("link-title", {"question-link-title": isPhy || !isQuiz})}><Markup encoding="latex">{title}</Markup></span>
                    {quizTag && <span className="quiz-level-1-tag ms-sm-2">{quizTag}</span>}
                    {isPhy && <div className="d-flex flex-column justify-self-end">
                        {supersededBy && <a 
                            className="superseded-tag mx-1 ms-sm-3 my-1 align-self-end" 
                            href={`/questions/${supersededBy}`}
                            onClick={(e) => e.stopPropagation()}
                        >SUPERSEDED</a>}
                        {tags?.includes("nofilter") && <span
                            className="superseded-tag mx-1 ms-sm-3 my-1 align-self-end" 
                        >NO-FILTER</span>}
                    </div>}
                </div>
                {subtitle && <div className="small text-muted text-wrap">
                    {subtitle}
                </div>}
                {breadcrumb && <span className="hierarchy-tags">
                    <Breadcrumb breadcrumb={breadcrumb}/>
                </span>}
                {audienceViews && fullWidth && <div className="d-flex mt-1"> 
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack/> 
                </div>}
                {status && (below["lg"](deviceSize) || fullWidth) && <div className="d-flex mt-1">
                    <StatusDisplay status={status}/>
                </div>}
                {linkTags && <div className="d-flex py-3 flex-wrap">
                    <LinkTags linkTags={linkTags}/>
                </div>}
                {isQuiz && fullWidth && <div className="d-flex d-md-none align-items-center">
                    <QuizLinks previewQuizUrl={previewQuizUrl} quizButton={quizButton}/>
                </div>}
            </div>
        </Col>
        {!fullWidth &&
            <>
                {!isQuiz && (audienceViews || status) && <Col xl={2} className={classNames("d-none d-xl-flex", {"list-view-border": (status && status !== CompletionState.NOT_ATTEMPTED)})}>
                    <StatusDisplay status={status ?? CompletionState.NOT_ATTEMPTED}/>
                </Col>}
                {audienceViews && <Col md={4} lg={5} xl={4} xxl={3} className={classNames("d-none d-md-flex justify-content-end", {"list-view-border": audienceViews.length > 0})}>
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack className="w-100"/> 
                </Col>}
                {isQuiz && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                    <QuizLinks previewQuizUrl={previewQuizUrl} quizButton={quizButton}/> 
                </Col>}
            </>
        }
    </div>;

    return <ListGroupItem 
        {...rest} 
        className={classNames("content-summary-item", rest.className, state)} 
        data-bs-theme={subject && !isDisabled ? subject : "neutral"}
    >
        {url && !isDisabled
            ? <Link to={url} className="w-100 h-100 align-items-start"> {cardBody} </Link> 
            : cardBody
        }
    </ListGroupItem>;
};
