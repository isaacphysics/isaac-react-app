import { Link } from "react-router-dom";
import React from "react";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { ViewingContext} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { Button, Col, ListGroup, ListGroupItem, Row } from "reactstrap";
import { AffixButton } from "../AffixButton";
import { Spacer } from "../Spacer";
import { CompletionState } from "../../../../IsaacApiTypes";

const Breadcrumb = ({breadcrumb}: {breadcrumb: string[]}) => {
    return <>
        {breadcrumb.map(b => (<span className="hierarchy-tag" key={b}>{b}</span>))}
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

const QuizLinks = (props: React.HTMLAttributes<HTMLSpanElement> & {previewUrl: string, testUrl: string}) => {
    const { previewUrl, testUrl, ...rest } = props;
    return <span {...rest} className={classNames(rest.className, "d-flex")}>
        <Spacer/>
        <Button to={previewUrl} color="keyline" className="set-quiz-button-md">
            Preview
        </Button>
        <span style={{minWidth: "20px"}}/>
        <AffixButton size="md" color="solid" to={testUrl} affix={{
            affix: "icon-right",
            position: "suffix",
            type: "icon"
        }}>
            Take the test
        </AffixButton>
    </span>;
};

export interface AbstractListViewItemProps {
    icon: React.JSX.Element;
    title: string;
    subtitle?: string;
    breadcrumb?: string[];
    status?: CompletionState;
    tags?: string[];
    testTag?: string;
    url?: string;
    audienceViews?: ViewingContext[];
    previewUrl?: string;
    testUrl?: string;
}

export const AbstractListViewItem = ({icon, title, subtitle, breadcrumb, status, tags, testTag, url, audienceViews, previewUrl, testUrl}: AbstractListViewItemProps) => { 
    const colWidths = previewUrl && testUrl ? [12,6,6,6] : [12,8,9,8];
    const cardBody = 
    <Row className="w-100">
        <Col xs={colWidths[0]} md={colWidths[1]} lg={colWidths[2]} xl={colWidths[3]} className="d-flex">
            <div className="me-2 list-view-icon">
                {icon}
            </div>
            <div className="justify-content-between">
                <div className="d-flex">
                    <span className="question-link-title">{title}</span>
                    {testTag && <span className="quiz-level-1-tag ms-sm-2">{testTag}</span>}
                </div>
                {subtitle && <div className="small text-muted">{subtitle}</div>}
                {tags && <div className="small text-muted">{tags.join(", ")}</div>}
                {breadcrumb && <div className={"hierarchy-tags"}>
                    <Breadcrumb breadcrumb={breadcrumb}/>
                </div>}
                {audienceViews && <div className="d-flex d-md-none"> 
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={true}/> 
                </div>}
                {status && <div className="d-flex d-xl-none">
                    <StatusDisplay status={status}/>
                </div>}
                {previewUrl && testUrl && <div className="d-flex d-md-none align-items-center">
                    <QuizLinks previewUrl={previewUrl} testUrl={testUrl}/>
                </div>}
            </div>
        </Col>
        {status && <Col xl={2} className="d-none d-xl-flex list-view-border">
            <StatusDisplay status={status}/>
        </Col>}
        {audienceViews && <Col md={4} lg={3} xl={2} className="d-none d-md-flex list-view-border">
            <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={true}/> 
        </Col>}
        {previewUrl && testUrl && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
            <QuizLinks previewUrl={previewUrl} testUrl={testUrl}/> 
        </Col>}
    </Row>;

    return <ListGroupItem className="content-summary-item">
        {url ? <Link to={{pathname: url}}>
            {cardBody}
        </Link> : 
            <div> 
                {cardBody} 
            </div>}
    </ListGroupItem>;
};

export const AbstractListView = ({items}: {items: AbstractListViewItemProps[]}) => {
    return <ListGroup className="link-list list-group-links">
        {items.map(item => <AbstractListViewItem key={item.title} {...item}/>)}
    </ListGroup>;
}; 
