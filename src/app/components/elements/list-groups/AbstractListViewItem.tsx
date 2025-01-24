import { Link } from "react-router-dom";
import React from "react";
import { StageAndDifficultySummaryIcons } from "../StageAndDifficultySummaryIcons";
import { ShortcutResponse, Subject, ViewingContext} from "../../../../IsaacAppTypes";
import classNames from "classnames";
import { Button, Col, ListGroup, ListGroupItem, Row } from "reactstrap";
import { AffixButton } from "../AffixButton";
import { Spacer } from "../Spacer";
import { CompletionState } from "../../../../IsaacApiTypes";
import { determineAudienceViews } from "../../../services/userViewingContext";
import { above, below, TAG_ID, tags, useDeviceSize } from "../../../services";
import { PhyHexIcon } from "../svg/PhyHexIcon";
import { TitleIconProps } from "../PageTitle";

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

const Tags = ({tags}: {tags: {tag: string, url?: string}[];}) => {
    return <>
        {tags.map(t => t.url ?
            <Link to={t.url} className="card-tag" key={t.tag}>{t.tag}</Link> :
            <div className="card-tag" key={t.tag}>{t.tag}</div>
        )}
    </>;
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

export interface ListViewTagProps {
    tag: string;
    url?: string;
}

export interface AbstractListViewItemProps {
    icon: TitleIconProps;
    title: string;
    subject?: Subject;
    subtitle?: string;
    breadcrumb?: string[];
    status?: CompletionState;
    tags?: ListViewTagProps[];
    testTag?: string;
    url?: string;
    audienceViews?: ViewingContext[];
    previewUrl?: string;
    testUrl?: string;
    isCard?: boolean;
    fullWidth?: boolean;
}

export const AbstractListViewItem = ({icon, title, subject, subtitle, breadcrumb, status, tags, testTag, url, audienceViews, previewUrl, testUrl, isCard, fullWidth, ...rest}: AbstractListViewItemProps) => { 
    const deviceSize = useDeviceSize();
    const isQuiz: boolean = (previewUrl && testUrl) ? true : false;
    
    fullWidth = fullWidth || below["sm"](deviceSize) || ((status || audienceViews || previewUrl || testUrl) ? false : true);
    const colWidths = fullWidth ? [12,12,12,12,12] : isQuiz ? [12,6,6,6,6] : [12,8,7,6,7];
    const cardBody =
    <Row className="w-100 flex-row" {...rest}>
        <Col xs={colWidths[0]} md={colWidths[1]} lg={colWidths[2]} xl={colWidths[3]} xxl={colWidths[4]} className={classNames("d-flex", {"mt-3": isCard})}>
            <div>
                {icon && (
                    icon.type === "img" ? <img src={icon.icon} alt="" className="me-3"/> 
                        : icon.type === "hex" ? <PhyHexIcon icon={icon.icon} subject={icon.subject} size={icon.size}/> : undefined)}
            </div>
            <div className="align-content-center">
                <div className="d-flex">
                    <span className="question-link-title">{title}</span>
                    {testTag && <span className="quiz-level-1-tag ms-sm-2">{testTag}</span>}
                </div>
                {subtitle && <div className="small text-muted">
                    {subtitle}
                </div>}
                {breadcrumb && <div className="hierarchy-tags">
                    <Breadcrumb breadcrumb={breadcrumb}/>
                </div>}
                {audienceViews && fullWidth && <div className="d-flex"> 
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack/> 
                </div>}
                {status && (below["lg"](deviceSize) || fullWidth) && <div className="d-flex">
                    <StatusDisplay status={status}/>
                </div>}
                {tags && <div className="d-flex py-3">
                    <Tags tags={tags}/>
                </div>}
                {previewUrl && testUrl && fullWidth && <div className="d-flex d-md-none align-items-center">
                    <QuizLinks previewUrl={previewUrl} testUrl={testUrl}/>
                </div>}
            </div>
        </Col>
        {!fullWidth &&
            <>
                {!isQuiz && (audienceViews || status) && <Col xl={2} className={classNames("d-none d-xl-flex", {"list-view-border": (status && status !== CompletionState.NOT_ATTEMPTED)})}>
                    <StatusDisplay status={status ?? CompletionState.NOT_ATTEMPTED}/>
                </Col>}
                {audienceViews && <Col md={4} lg={5} xl={4} xxl={3} className="d-none d-md-flex justify-content-end">
                    <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack spacerWidth={5} className={classNames({"list-view-border": audienceViews.length > 0})}/> 
                </Col>}
                {previewUrl && testUrl && <Col md={6} className="d-none d-md-flex align-items-center justify-content-end">
                    <QuizLinks previewUrl={previewUrl} testUrl={testUrl}/> 
                </Col>}
            </>
        }
    </Row>;

    return <ListGroupItem className="content-summary-item" data-bs-theme={subject}>
        {url ? 
            <Link to={{pathname: url}}> {cardBody} </Link> : 
            <div> {cardBody} </div>}
    </ListGroupItem>;
};

export const AbstractListView = ({items}: {items: ShortcutResponse[]}) => {
    return <ListGroup className="link-list list-group-links">
        {items.map(item => 
            <AbstractListViewItem 
                key={item.title}
                icon={{type: "img", icon: "/assets/phy/icons/redesign/subject-physics.svg"}}
                title={item.title ?? ""}
                subtitle={item.subtitle}
                breadcrumb={tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[]).map(tag => tag.title)}
                status={item.state}
                url={item.url}
                audienceViews={determineAudienceViews(item.audience)}
                previewUrl={"item.previewUrl"}
                testUrl={"item.testUrl"}
            />)}
    </ListGroup>;
};

/*export const AbstractListViewWithProps = ({items}: {items: AbstractListViewItemProps[]}) => {
    return <ListGroup data-bs-theme="physics" className="link-list list-group-links">
        {items.map(item => <AbstractListViewItem key={item.title} {...item}/>)}
    </ListGroup>;
};*/ 
