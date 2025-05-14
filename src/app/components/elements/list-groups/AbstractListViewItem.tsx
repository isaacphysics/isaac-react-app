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

const LinkTags = ({linkTags}: {linkTags: ListViewTagProps[];}) => {
    return <>
        {linkTags.map(t => {
            const {url, tag, ...rest} = t;
            return url ?
                <Link {...rest} to={url} className="card-tag" key={tag}>{tag}</Link> :
                <div {...rest} className="card-tag" key={tag}>{tag}</div>;
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
}

export const AbstractListViewItem = ({icon, title, subject, subtitle, breadcrumb, status, tags, supersededBy, linkTags, quizTag, url, audienceViews, previewQuizUrl, quizButton, isCard, fullWidth, ...rest}: AbstractListViewItemProps) => { 
    const deviceSize = useDeviceSize();
    const isQuiz: boolean = !!(previewQuizUrl || quizButton);
    
    fullWidth = fullWidth || below["sm"](deviceSize) || ((status || audienceViews || previewQuizUrl || quizButton) ? false : true);
    const cardBody =
    <div className="w-100 d-flex flex-row">
        <Col className={classNames("d-flex flex-grow-1", {"mt-3": isCard && linkTags?.length, "mb-3": isCard && !linkTags?.length})}>
            <div className="position-relative">
                {icon && (
                    icon.type === "img" ? <img src={icon.icon} alt="" className="me-3"/> 
                        : icon.type === "hex" ? <PhyHexIcon icon={icon.icon} subject={icon.subject} size={icon.size}/> : undefined)
                }
                {status && status === CompletionState.ALL_CORRECT && <div className="list-view-status-indicator">
                    <StatusDisplay status={status} showText={false} />
                </div>}
            </div>
            <div className="align-content-center text-overflow-ellipsis pe-2">
                <div className="d-flex text-wrap">
                    <span className={classNames("link-title", {"question-link-title": isPhy || !isQuiz})}><Markup encoding="latex">{title}</Markup></span>
                    {quizTag && <span className="quiz-level-1-tag ms-sm-2">{quizTag}</span>}
                    {isPhy && <div className="d-flex flex-column justify-self-end">
                        {supersededBy && <a 
                            className="superseded-tag mx-1 ms-sm-3 align-self-end" 
                            href={`/questions/${supersededBy}`}
                            onClick={(e) => e.stopPropagation()}
                        >SUPERSEDED</a>}
                        {tags?.includes("nofilter") && <span
                            className="superseded-tag mx-1 ms-sm-3 align-self-end" 
                        >NO-FILTER</span>}
                    </div>}
                </div>
                {subtitle && <div className="small text-muted text-wrap">
                    {subtitle}
                </div>}
                {breadcrumb && <span className="hierarchy-tags d-flex flex-wrap mw-auto">
                    <Breadcrumb breadcrumb={breadcrumb}/>
                </span>}
                {audienceViews && fullWidth && <div className="d-flex mt-1"> 
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack/> 
                </div>}
                {status && status !== CompletionState.ALL_CORRECT && fullWidth &&
                    <StatusDisplay status={status} showText className="py-1" />
                }
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
                {status && status !== CompletionState.ALL_CORRECT && <StatusDisplay status={status} showText className="ms-2 me-3" />}
                {audienceViews && <div className={classNames("d-none d-md-flex justify-content-end wf-13", {"list-view-border": audienceViews.length > 0})}>
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack className="w-100"/> 
                </div>}
                {isQuiz && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                    <QuizLinks previewQuizUrl={previewQuizUrl} quizButton={quizButton}/> 
                </Col>}
            </>
        }
    </div>;

    return <ListGroupItem {...rest} className={classNames("content-summary-item", {"correct": status === CompletionState.ALL_CORRECT}, rest.className)} data-bs-theme={subject}>
        {url 
            ? <Link to={url} className="w-100 h-100 align-items-start"> {cardBody} </Link> 
            : cardBody
        }
    </ListGroupItem>;
};
