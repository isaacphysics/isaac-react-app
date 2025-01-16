import {CompletionState, ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {Link} from "react-router-dom";
import React, {useRef} from "react";
import {selectors, useAppSelector} from "../../../state";
import {v4 as uuid_v4} from "uuid";
import {StageAndDifficultySummaryIcons} from "../StageAndDifficultySummaryIcons";
import {ShortcutResponse, ViewingContext} from "../../../../IsaacAppTypes";
import {Markup} from "../markup";
import classNames from "classnames";
import {Button, Col, ListGroup, ListGroupItem, Row, UncontrolledTooltip} from "reactstrap";
import { CSSModule } from "reactstrap/types/lib/utils";
import { LLMFreeTextQuestionIndicator } from "../LLMFreeTextQuestionIndicator";
import { AffixButton } from "../AffixButton";
import { Spacer } from "../Spacer";

export enum ContentTypeVisibility {
    SHOWN, // default if not specified
    ICON_ONLY,
    FULLY_HIDDEN
}

export enum STATUS {
    IN_PROGRESS = "status-in-progress",
    CORRECT = "status-correct",
    INCORRECT = "status-incorrect",
}

const StatusDisplay = (props: React.HTMLAttributes<HTMLSpanElement> & {status: STATUS}) => {
    const { status, ...rest } = props;
    let text;
    switch (status) {
        case STATUS.IN_PROGRESS:
            text = "In progress";
            break;
        case STATUS.CORRECT:
            text = "Correct";
            break;
        case STATUS.INCORRECT:
            text = "Incorrect";
            break;
    }

    return <span {...rest} className={classNames(rest.className, "d-flex align-items-center")}>
        <img className="pe-2" src={`/assets/phy/icons/redesign/${status}.svg`} alt=""/>
        {text}
    </span>;
};

/* export interface ListGroupItemProps extends React.HTMLAttributes<HTMLElement> {
  [key: string]: any;
  tag?: React.ElementType;
  active?: boolean;
  disabled?: boolean;
  color?: string;
  action?: boolean;
  cssModule?: CSSModule;
  href?: string;
} */

export interface AbstractListViewItemProps {
    icon: React.JSX.Element;
    title: string;
    subtitle?: string;
    breadcrumb?: string[];
    status?: STATUS;
    tags?: string[]; // Ordering of tags/subtitle is unclear. I say subtitle first, then tags.
    testTag?: string;
    url?: string;
    audienceViews?: ViewingContext[];
    previewUrl?: string;
    testUrl?: string;
}

export const AbstractListViewItem = ({icon, title, subtitle, breadcrumb, status, tags, testTag, url, audienceViews, previewUrl, testUrl}: AbstractListViewItemProps) => { 

    const a = 
    <Row className="w-100">
        <Col xs={2} md={1}>
            {icon}
        </Col>
        <Col xs={10} md={7} lg={8} xl={7}>
            {/* Title TestTag Subtitle Tags Breadcrumb */}
            <div className="justify-content-between content-summary-link-title">
                <div className="d-flex">
                    <span className="question-link-title">{title}</span>
                    {testTag && <span className="quiz-level-1-tag mx-1 ms-sm-3">{testTag}</span>}
                </div>
            
                {subtitle && <div className="small text-muted d-block">{subtitle}</div>}
                {tags && <div className="small text-muted d-block">{tags.join(", ")}</div>}
                {breadcrumb && <div className={"hierarchy-tags d-block"}>
                    {breadcrumb.map(b => (<span className="hierarchy-tag" key={b}>{b}</span>))}
                </div>}
                {audienceViews && <div className="d-flex d-md-none"> 
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={true}/> 
                </div>}
                {status && <div className="d-flex d-xl-none" style={{fontSize: "0.825rem"}}>
                    <StatusDisplay status={status}/>
                </div>}
                {previewUrl && testUrl && <Col xs={12} md={4} className="d-flex align-items-center">
                    {/* PreviewURL  TestURL */}
                    <a href={previewUrl}>
                        <button type="button" className="d-block d-md-none h-4 p-0 set-quiz-button-md btn btn-secondary" style={{minWidth: "120px", height: "45px"}}>Preview</button>
                    </a>
                    <a href={testUrl}>
                        <button type="button" className="d-block d-md-none h-4 p-0 set-quiz-button-md btn btn-primary" style={{minWidth: "120px", height: "45px"}}>
                            <div className="mx-3">
                                Take the test
                                <img className="ps-1 mb-1" src={`/assets/phy/icons/redesign/arrow-right.svg`} alt=""/>
                            </div>
                        </button>
                    </a>
                </Col>}
            </div>
        </Col>
        {status && <Col md={2} className="d-none d-xl-flex" style={{borderLeft: "1px solid #a5a5a4"}}>
            {/* Status (but only on bigger screens) */}
            {status && <div className="d-none d-xl-flex flex-column" style={{fontSize: "0.825rem"}}>
                <StatusDisplay status={status}/>
            </div>}
        </Col>}
        {audienceViews && <Col md={4} lg={3} xl={2} className="d-none d-md-flex" style={{borderLeft: "1px solid #a5a5a4"}}>
            {/* Stage (but only on bigger screens) */}
            <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={true}/> 
        </Col>}
        {previewUrl && testUrl && <Col xs={12} md={4} className="d-flex align-items-center justify-content-end">
            {/* PreviewURL  TestURL */}
            <Spacer/>
            <Button to={previewUrl} color="keyline" className="d-none d-md-block h-4 p-0 set-quiz-button-md" style={{minWidth: "120px", height: "45px"}}>Preview</Button>
            <Spacer width={5}/>
            <AffixButton size="md" color="solid" tag={Link} to={testUrl} affix={{
                affix: "icon-right",
                position: "suffix",
                type: "icon"
            }}>
                Take the test
            </AffixButton>
            
        </Col>}
    </Row>;

    return <ListGroupItem className="p-3 d-md-flex flex-column justify-content-center content-summary-item"> {/* data-bs-theme={itemSubject?.id} key={linkDestination}> */}
        {url ? <Link to={{pathname: url}}>
            {a}
        </Link> : <div> {a} </div>}

    </ListGroupItem>;
};

export const AbstractListView = ({items}: {items: AbstractListViewItemProps[]}) => {
    return <ListGroup className="link-list list-group-links mb-3m-0 list-group">
        {items.map(item => <AbstractListViewItem key={item.title} {...item}/>)}
    </ListGroup>;
}; 
