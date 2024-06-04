import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    filterAudienceViewsByProperties,
    generateQuestionTitle,
    isAda,
    isIntendedAudience,
    isPhy,
    notRelevantMessage,
    SEARCH_RESULT_TYPE,
    siteSpecific,
    TAG_ID,
    TAG_LEVEL,
    tags,
    useDeviceSize,
    useUserContext
} from "../../../services";
import {Link} from "react-router-dom";
import React, {useRef} from "react";
import {selectors, useAppSelector} from "../../../state";
import {v4 as uuid_v4} from "uuid";
import {StageAndDifficultySummaryIcons} from "../StageAndDifficultySummaryIcons";
import {ShortcutResponse} from "../../../../IsaacAppTypes";
import {Markup} from "../markup";
import classNames from "classnames";
import {ListGroup, ListGroupItem, UncontrolledTooltip} from "reactstrap";

export const ContentSummaryListGroupItem = ({item, search, displayTopicTitle}: {item: ShortcutResponse; search?: string; displayTopicTitle?: boolean}) => {
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const userContext = useUserContext();
    const user = useAppSelector(selectors.user.orNull);
    const isContentsIntendedAudience = isIntendedAudience(item.audience, {...userContext, showOtherContent: false}, user);
    const hash = item.hash;

    let linkDestination, icon, audienceViews;
    let itemClasses = "p-0 content-summary-link ";
    itemClasses += isContentsIntendedAudience ? "bg-transparent " : "de-emphasised ";

    let title = item.title;
    let titleClasses = "content-summary-link-title flex-grow-1 ";
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[]);
    if (itemSubject) {
        titleClasses += itemSubject.id;
    }
    const iconClasses = `search-item-icon ${itemSubject?.id}-fill`;
    const hierarchyTags = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[])
        .filter((t, i) => !isAda || i !== 0); // CS always has Computer Science at the top level

    // FIXME "correct" never actually exists on questions here...
    const questionIconLabel = item.correct ? "Completed question icon" : "Question icon";
    const questionIcon = siteSpecific(
        item.correct ?
            <svg className={iconClasses} aria-label={questionIconLabel}><use href={`/assets/phy/icons/tick-rp-hex.svg#icon`} xlinkHref={`/assets/phy/icons/tick-rp-hex.svg#icon`}/></svg> :
            <svg className={iconClasses} aria-label={questionIconLabel}><use href={`/assets/phy/icons/question-hex.svg#icon`} xlinkHref={`/assets/phy/icons/question-hex.svg#icon`}/></svg>,
        item.correct ?
            <img src="/assets/cs/icons/question-correct.svg" alt={questionIconLabel}/> :
            <img src="/assets/cs/icons/question-not-started.svg" alt={questionIconLabel}/>
    );

    const deviceSize = useDeviceSize();

    let typeLabel;

    switch (item.type) {
        case (SEARCH_RESULT_TYPE.SHORTCUT):
            linkDestination = item.url;
            icon = <img src={siteSpecific("/assets/phy/icons/concept.svg", "/assets/cs/icons/concept.svg")} alt="Shortcut icon"/>;
            if (isAda) {
                typeLabel = "Shortcut";
            }
            break;
        case (DOCUMENT_TYPE.QUESTION):
        case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
            title = generateQuestionTitle(item);
            if (isPhy) {
                itemClasses += item.correct ? "bg-success" : "text-info";
            }
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}`;
            icon = questionIcon;
            audienceViews = filterAudienceViewsByProperties(determineAudienceViews(item.audience), AUDIENCE_DISPLAY_FIELDS);
            if (isAda) {
                typeLabel = "Question";
            }
            break;
        case (DOCUMENT_TYPE.CONCEPT):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`;
            icon = <img src={siteSpecific("/assets/phy/icons/concept.svg", "/assets/cs/icons/concept.svg")} alt="Concept page icon"/>;
            if (isAda) {
                typeLabel = "Concept";
            }
            break;
        case (DOCUMENT_TYPE.EVENT):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.EVENT]}/${item.id}`;
            icon = <img src={siteSpecific("/assets/common/icons/event-md.svg", "/assets/cs/icons/event.svg")} alt="Event page icon"/>;
            typeLabel = "Event";
            break;
        case (DOCUMENT_TYPE.TOPIC_SUMMARY):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.TOPIC_SUMMARY]}/${item.id?.slice("topic_summary_".length)}`;
            icon = <img src={siteSpecific("/assets/common/icons/work-md.svg", "/assets/cs/icons/topic.svg")} alt="Topic summary page icon"/>;
            typeLabel = "Topic"
            break;
        case (DOCUMENT_TYPE.GENERIC):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.GENERIC]}/${item.id}`;
            icon = <img src={siteSpecific("/assets/common/icons/info-md.svg", "/assets/cs/icons/info-filled.svg")} alt="Generic page icon"/>;
            if (isAda) {
                typeLabel = "Info";
            }
            break;
        default:
            // Do not render this item if there is no matching DOCUMENT_TYPE
            console.error("Not able to display item as a ContentSummaryListGroupItem: ", item);
            return null;
    }

    return <ListGroupItem className={classNames("content-summary-item", itemClasses, {"p-3 d-md-flex flex-column justify-content-center": isPhy})} key={linkDestination}>
        <Link className={classNames({"position-relative justify-content-center": isAda})} to={{pathname: linkDestination, search: search, hash: hash}}>
            <span className={classNames({"content-summary-link-title align-self-center": isPhy, "question-progress-icon": isAda})}>
                {siteSpecific(
                    icon,
                    <div className={"inner-progress-icon"}>
                        {icon}<br/>
                        <span className={"icon-title"}>{typeLabel}</span>
                    </div>
                )}
            </span>
            <div className={classNames("flex-fill", {"d-flex py-3 pr-3": isAda, "d-md-flex": isPhy})}>
                <div className={"align-self-center " + titleClasses}>
                    <div className="d-flex">
                        <Markup encoding={"latex"} className={classNames( "question-link-title", {"text-secondary": isPhy})}>
                            {title ?? ""}
                        </Markup>
                        {isPhy && typeLabel && <span className={"small text-muted align-self-end d-none d-md-inline ml-2 mb-1"}>
                            ({typeLabel})
                        </span>}
                    </div>
                    {(isPhy && item.summary) && <div className="small text-muted d-none d-sm-block">
                        {item.summary}
                    </div>}
                    {(!item.summary || deviceSize === "xs") && item.subtitle && <div className="small text-muted d-block">
                        {item.subtitle}
                    </div>}
                    {displayTopicTitle && hierarchyTags && <div className={"hierarchy-tags d-none d-md-block"}>
                        {hierarchyTags.map(tag => (<span className="hierarchy-tag" key={tag.id}>{tag.title}</span>))}
                    </div>}
                </div>

                {!isContentsIntendedAudience && <div className="ml-auto mr-3 d-flex align-items-center">
                    <span id={`audience-help-${componentId}`} className="icon-help mx-1" />
                    <UncontrolledTooltip placement="bottom" target={`audience-help-${componentId}`}>
                        {`This content has ${notRelevantMessage(userContext)}.`}
                    </UncontrolledTooltip>
                </div>}
                {audienceViews && audienceViews.length > 0 && <StageAndDifficultySummaryIcons audienceViews={audienceViews} />}
            </div>
            {isAda && <div className={"list-caret vertical-center"}><img src={"/assets/common/icons/chevron_right.svg"} alt={"Go to page"}/></div>}
        </Link>
    </ListGroupItem>;
};

export const LinkToContentSummaryList = ({items, search, displayTopicTitle, ...rest}: {
    items: ContentSummaryDTO[];
    search?: string;
    displayTopicTitle?: boolean;
    tag?: React.ElementType;
    flush?: boolean;
    className?: string;
    cssModule?: any;
}) => {
    return <ListGroup {...rest} className="link-list list-group-links mb-3">
        {items.map(item => <ContentSummaryListGroupItem item={item} search={search} key={item.type + "/" + item.id} displayTopicTitle={displayTopicTitle}/>)}
    </ListGroup>;
};
