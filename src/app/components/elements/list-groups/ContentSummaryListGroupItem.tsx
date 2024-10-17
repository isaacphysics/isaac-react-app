import {CompletionState, ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    AUDIENCE_DISPLAY_FIELDS,
    below,
    determineAudienceViews,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    filterAudienceViewsByProperties,
    generateQuestionTitle,
    isAda,
    isIntendedAudience,
    isPhy,
    isStaff,
    isTeacherOrAbove,
    notRelevantMessage,
    SEARCH_RESULT_TYPE,
    siteSpecific,
    TAG_ID,
    TAG_LEVEL,
    tags,
    useDeviceSize,
    useUserViewingContext
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
import { CSSModule } from "reactstrap/types/lib/utils";
import { LLMFreeTextQuestionIndicator } from "../LLMFreeTextQuestionIndicator";

export enum ContentTypeVisibility {
    SHOWN, // default if not specified
    ICON_ONLY,
    FULLY_HIDDEN
}

export const ContentSummaryListGroupItem = ({item, search, showBreadcrumb, noCaret, contentTypeVisibility, ignoreIntendedAudience}: {
    item: ShortcutResponse;
    search?: string;
    showBreadcrumb?: boolean;
    noCaret?: boolean;
    contentTypeVisibility?: ContentTypeVisibility;
    ignoreIntendedAudience?: boolean;
}) => {
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const userContext = useUserViewingContext();
    const user = useAppSelector(selectors.user.orNull);
    const isContentsIntendedAudience = ignoreIntendedAudience || isIntendedAudience(item.audience, {...userContext, showOtherContent: false}, user);
    const hash = item.hash;

    let linkDestination, icon, audienceViews;
    let itemClasses = "p-0 content-summary-link ";
    itemClasses += isContentsIntendedAudience && !item.supersededBy ? "bg-transparent " : "de-emphasised ";

    let stack = false;
    let title = item.title;
    let titleClasses = "content-summary-link-title flex-grow-1 ";
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[]);
    if (itemSubject) {
        titleClasses += itemSubject.id;
    }
    const iconClasses = `search-item-icon ${itemSubject?.id}-fill`;
    const hierarchyTags = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[])
        .filter((_t, i) => !isAda || i !== 0); // CS always has Computer Science at the top level

    let questionIconLabel, questionIcon;
    switch(item.state) {
        case CompletionState.IN_PROGRESS:
            questionIconLabel = "In progress question icon";
            questionIcon = siteSpecific(
                <svg className={iconClasses} aria-label={questionIconLabel}><use href={`/assets/phy/icons/incomplete-hex.svg#icon`} xlinkHref={`/assets/phy/icons/incomplete-hex.svg#icon`}/></svg>,
                <img src="/assets/common/icons/incorrect.svg" alt={questionIconLabel}/>
            );
            break;
        case CompletionState.ALL_CORRECT:
            questionIconLabel = "Complete question icon";
            questionIcon = siteSpecific(
                <svg className={iconClasses} aria-label={questionIconLabel}><use href={`/assets/phy/icons/tick-rp-hex.svg#icon`} xlinkHref={`/assets/phy/icons/tick-rp-hex.svg#icon`}/></svg>,
                <img src="/assets/common/icons/completed.svg" alt={questionIconLabel}/>
            );
            break;
        case CompletionState.NOT_ATTEMPTED:
        default:
            questionIconLabel = "Not attempted question icon";
            questionIcon = siteSpecific(
                <svg className={iconClasses} aria-label={questionIconLabel}><use href={`/assets/phy/icons/question-hex.svg#icon`} xlinkHref={`/assets/phy/icons/question-hex.svg#icon`}/></svg>,
                <img src="/assets/common/icons/not-started.svg" alt={questionIconLabel}/>
            );
            break;
    }

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
                itemClasses += item.state === CompletionState.ALL_CORRECT ? "bg-success" : "text-info";
            }
            if (isAda) {
                typeLabel = "Question";
            }
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}`;
            icon = questionIcon;
            audienceViews = filterAudienceViewsByProperties(determineAudienceViews(item.audience), AUDIENCE_DISPLAY_FIELDS);
            stack = below["md"](deviceSize);
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
            typeLabel = "Topic";
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

    return <ListGroupItem className={classNames(itemClasses, {"p-3 d-md-flex flex-column justify-content-center content-summary-item": isPhy})} key={linkDestination}>
        <Link className={classNames({"position-relative justify-content-center": isAda})} to={{pathname: linkDestination, search: search, hash: hash}}>
            {contentTypeVisibility !== ContentTypeVisibility.FULLY_HIDDEN && <span className={classNames({"content-summary-link-title align-self-center": isPhy, "question-progress-icon": isAda})}>
                {siteSpecific(
                    icon,
                    <div className={"inner-progress-icon"}>
                        {icon}
                        {contentTypeVisibility !== ContentTypeVisibility.ICON_ONLY && <>
                            <br/>
                            <span className={"icon-title"}>{typeLabel}</span>
                        </>}
                    </div>
                )}
            </span>}
            <div className={classNames("flex-fill", {"py-3 pe-3 align-content-center": isAda, "d-flex": isAda && !stack, "d-md-flex": isPhy})}>
                <div className={"align-self-center " + titleClasses}>
                    <div className="d-flex">
                        <Markup encoding={"latex"} className={classNames( "question-link-title", {"text-secondary": isPhy})}>
                            {title ?? ""}
                        </Markup>
                        {isPhy && typeLabel && <span className={"small text-muted align-self-end d-none d-md-inline ms-2 mb-1"}>
                            ({typeLabel})
                        </span>}
                        {isPhy && item.supersededBy && isTeacherOrAbove(user) ? <a 
                            className="superseded-tag mx-1 ms-sm-3" 
                            href={`/questions/${item.supersededBy}`}
                            onClick={(e) => e.stopPropagation()}
                        >SUPERSEDED</a> : null}
                        {isPhy && item.tags && item.tags.includes("nofilter") && isStaff(user) ? <span
                            className="superseded-tag mx-1 ms-sm-3"
                        >NO-FILTER</span> : null}
                    </div>
                    {(isPhy && item.summary) && <div className="small text-muted d-none d-sm-block">
                        {item.summary}
                    </div>}
                    {(!item.summary || deviceSize === "xs") && item.subtitle && <div className="small text-muted d-block">
                        {item.subtitle}
                    </div>}
                    {showBreadcrumb && hierarchyTags && <div className={"hierarchy-tags d-none d-md-block"}>
                        {hierarchyTags.map(tag => (<span className="hierarchy-tag" key={tag.id}>{tag.title}</span>))}
                    </div>}
                    {item.tags?.includes("llm_question_page") && <div className="ms-n1 my-2 mb-lg-0">
                        <LLMFreeTextQuestionIndicator small />
                    </div>}
                </div>

                {isPhy && !isContentsIntendedAudience && <div className="ms-auto me-3 d-flex align-items-center">
                    <span id={`audience-help-${componentId}`} className="icon-help mx-1" />
                    <UncontrolledTooltip placement="bottom" target={`audience-help-${componentId}`}>
                        {`This content has ${notRelevantMessage(userContext)}.`}
                    </UncontrolledTooltip>
                </div>}
                <div>
                    {audienceViews && audienceViews.length > 0 && <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={stack}/>}
                </div>
            </div>
            {isAda && !noCaret && <div className={"list-caret vertical-center"}><img src={"/assets/common/icons/chevron_right.svg"} alt={"Go to page"}/></div>}
        </Link>
    </ListGroupItem>;
};

export const LinkToContentSummaryList = ({items, search, showBreadcrumb, noCaret, contentTypeVisibility, ignoreIntendedAudience, ...rest}: {
    items: ContentSummaryDTO[];
    search?: string;
    showBreadcrumb?: boolean;
    noCaret?: boolean;
    contentTypeVisibility?: ContentTypeVisibility;
    ignoreIntendedAudience?: boolean;
    tag?: React.ElementType;
    flush?: boolean;
    className?: string;
    cssModule?: CSSModule;
}) => {
    return <ListGroup {...rest} className={"link-list list-group-links mb-3" + rest.className}>
        {items.map(item => <ContentSummaryListGroupItem
            item={item} search={search} noCaret={noCaret}
            key={item.type + "/" + item.id} showBreadcrumb={showBreadcrumb}
            contentTypeVisibility={contentTypeVisibility} ignoreIntendedAudience={ignoreIntendedAudience}
        />)}
    </ListGroup>;
};
