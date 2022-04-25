import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    SEARCH_RESULT_TYPE,
    TAG_ID,
    TAG_LEVEL
} from "../../../services/constants";
import * as RS from "reactstrap";
import {Link} from "react-router-dom";
import React, {useRef} from "react";
import tags from "../../../services/tags";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {
    AUDIENCE_DISPLAY_FIELDS,
    determineAudienceViews,
    filterAudienceViewsByProperties,
    isIntendedAudience,
    notRelevantMessage,
    useUserContext
} from "../../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../../state/selectors";
import {v4 as uuid_v4} from "uuid";
import {LaTeX} from "../LaTeX";
import {generateQuestionTitle} from "../../../services/questions";
import {StageAndDifficultySummaryIcons} from "../StageAndDifficultySummaryIcons";
import {ShortcutResponse} from "../../../../IsaacAppTypes";

export const ContentSummaryListGroupItem = ({item, search, displayTopicTitle}: {item: ShortcutResponse; search?: string; displayTopicTitle?: boolean}) => {
    const componentId = useRef(uuid_v4().slice(0, 4)).current;
    const userContext = useUserContext();
    const user = useSelector(selectors.user.orNull);
    const isContentsIntendedAudience = isIntendedAudience(item.audience, {...userContext, showOtherContent: false}, user);
    const hash = item.hash;

    let linkDestination, icon, iconLabel, audienceViews;
    let itemClasses = "p-0 content-summary-link ";
    itemClasses += isContentsIntendedAudience ? "bg-transparent " : "de-emphasised ";

    let title = item.title;
    let titleClasses = "content-summary-link-title flex-grow-1 ";
    let titleTextClass = SITE_SUBJECT == SITE.PHY ? "text-secondary" : undefined;
    const itemSubject = tags.getSpecifiedTag(TAG_LEVEL.subject, item.tags as TAG_ID[]);
    if (itemSubject) {
        titleClasses += itemSubject.id;
    }
    const iconClasses = `search-item-icon ${itemSubject?.id}-fill`;
    const hierarchyTags = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[])
        .filter((t, i) => SITE_SUBJECT !== SITE.CS || i !== 0); // CS always has Computer Science at the top level

    const questionIcon = {
        [SITE.CS]: item.correct ?
            <img src="/assets/tick-rp.svg" alt=""/> :
            <img src="/assets/question.svg" alt="Question page"/>,
        [SITE.PHY]: item.correct ?
            <svg className={iconClasses}><use href={`/assets/tick-rp-hex.svg#icon`} xlinkHref={`/assets/tick-rp-hex.svg#icon`}/></svg> :
            <svg className={iconClasses}><use href={`/assets/question-hex.svg#icon`} xlinkHref={`/assets/question-hex.svg#icon`}/></svg>
    }[SITE_SUBJECT];

    let typeLabel;

    switch (item.type) {
        case (SEARCH_RESULT_TYPE.SHORTCUT):
            linkDestination = item.url;
            icon = <img src="/assets/concept.svg" alt="Shortcut"/>;
            iconLabel = "Shortcut icon";
            break;
        case (DOCUMENT_TYPE.QUESTION):
            title = generateQuestionTitle(item);
            itemClasses += item.correct ? "bg-success" : "text-info";
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.QUESTION]}/${item.id}`;
            icon = questionIcon;
            iconLabel = item.correct ? "Completed question icon" : "Question icon";
            audienceViews = filterAudienceViewsByProperties(determineAudienceViews(item.audience), AUDIENCE_DISPLAY_FIELDS);
            break;
        case (DOCUMENT_TYPE.CONCEPT):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`;
            icon = <img src="/assets/concept.svg" alt="Concept page"/>;
            iconLabel = "Concept page icon";
            break;
        case (DOCUMENT_TYPE.EVENT):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.EVENT]}/${item.id}`;
            icon = <img src="/assets/event-md.svg" alt="Event"/>;
            iconLabel = "Event page icon";
            typeLabel = "Event";
            break;
        case (DOCUMENT_TYPE.TOPIC_SUMMARY):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.TOPIC_SUMMARY]}/${item.id?.slice("topic_summary_".length)}`;
            icon = <img src="/assets/work-md.svg" alt="Topic summary"/>;
            iconLabel = "Topic summary page icon";
            typeLabel = "Topic"
            break;
        case (DOCUMENT_TYPE.GENERIC):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.GENERIC]}/${item.id}`;
            icon = <img src="/assets/info-md.svg" alt="Generic page"/>;
            iconLabel = "Topic summary page icon";
            break;
        default:
            // Do not render this item if there is no matching DOCUMENT_TYPE
            console.error("Not able to display item as a ContentSummaryListGroupItem: ", item);
            return null;
    }

    const displayStage = audienceViews && audienceViews.length > 0;

    return <RS.ListGroupItem className={`p-3 content-summary-item d-md-flex flex-column justify-content-center ${itemClasses}`} key={linkDestination}>
        <Link to={{pathname: linkDestination, search: search, hash: hash}}>
            <span className="content-summary-link-title align-self-center" role="img" aria-label={iconLabel}>{icon}</span>
            <div className="d-md-flex flex-fill">
                <div className={"align-self-center " + titleClasses}>
                    <div className="d-flex">
                        <LaTeX className={titleTextClass} markup={title ?? ""} />
                        {typeLabel && <span className={"small text-muted align-self-end d-none d-md-inline ml-2"}>
                            ({typeLabel})
                        </span>}
                    </div>
                    {displayTopicTitle && hierarchyTags && <div className={"hierarchy-tags"}>
                        {hierarchyTags.map(tag => (<span className="hierarchy-tag" key={tag.id}>{tag.title}</span>))}
                    </div>}
                    {item.summary && <div className="small text-muted d-none d-md-block">
                        {item.summary}
                    </div>}
                </div>

                {!isContentsIntendedAudience && <div className="ml-auto mr-3 d-flex align-items-center">
                    <span id={`audience-help-${componentId}`} className="icon-help mx-1" />
                    <RS.UncontrolledTooltip placement="bottom" target={`audience-help-${componentId}`}>
                        {`This content has ${notRelevantMessage(userContext)}.`}
                    </RS.UncontrolledTooltip>
                </div>}
                {audienceViews && displayStage && <StageAndDifficultySummaryIcons audienceViews={audienceViews} />}
            </div>
        </Link>
    </RS.ListGroupItem>;
};

export const linkToContent = (search: string | undefined, item: ContentSummaryDTO, displayTopicTitle: boolean | undefined) => {
    return <ContentSummaryListGroupItem item={item} search={search} key={item.type + "/" + item.id} displayTopicTitle={displayTopicTitle}/>
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
    return <RS.ListGroup {...rest} className="mb-3 link-list list-group-links">
        {items.map(item => linkToContent(search, item, displayTopicTitle))}
    </RS.ListGroup>;
};
