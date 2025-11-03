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
    SEARCH_RESULT_TYPE,
    TAG_ID,
    TAG_LEVEL,
    tags,
    useDeviceSize,
    useUserViewingContext
} from "../../../services";
import {Link} from "react-router-dom";
import React from "react";
import {selectors, useAppSelector} from "../../../state";
import {StageAndDifficultySummaryIcons} from "../StageAndDifficultySummaryIcons";
import {ShortcutResponse} from "../../../../IsaacAppTypes";
import {Markup} from "../markup";
import classNames from "classnames";
import {ListGroup, ListGroupItem} from "reactstrap";
import { CSSModule } from "reactstrap/types/lib/utils";
import { LLMFreeTextQuestionIndicator } from "../LLMFreeTextQuestionIndicator";
import { QuestionPropertyTags } from "../ContentPropertyTags";

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
    const userContext = useUserViewingContext();
    const user = useAppSelector(selectors.user.orNull);
    const isContentsIntendedAudience = ignoreIntendedAudience || isIntendedAudience(item.audience, userContext, user);
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
    const hierarchyTags = tags.getByIdsAsHierarchy((item.tags || []) as TAG_ID[])
        .filter((_t, i) => !isAda || i !== 0); // CS always has Computer Science at the top level

    let questionIconLabel, questionIcon;
    switch(item.state) {
        case CompletionState.IN_PROGRESS:
            questionIconLabel = "In progress question icon";
            questionIcon = <img src="/assets/cs/icons/status-in-progress.svg" alt={questionIconLabel} />;
            break;
        case CompletionState.ALL_CORRECT:
            questionIconLabel = "Complete question icon";
            questionIcon = <img src="/assets/cs/icons/status-correct.svg" alt={questionIconLabel} />;
            break;
        case CompletionState.ALL_INCORRECT:
            questionIconLabel = "Incorrect question icon";
            questionIcon = <img src="/assets/cs/icons/status-incorrect.svg" alt={questionIconLabel} />;
            break;
        case CompletionState.NOT_ATTEMPTED:
        default:
            questionIconLabel = "Not attempted question icon";
            questionIcon = <img src="/assets/cs/icons/status-not-started.svg" alt={questionIconLabel} />;
            break;
    }

    const deviceSize = useDeviceSize();

    let typeLabel;

    switch (item.type) {
        case (SEARCH_RESULT_TYPE.SHORTCUT):
            linkDestination = item.url;
            icon = <img src={"/assets/cs/icons/concept.svg"} alt="Shortcut icon"/>;
            if (isAda) {
                typeLabel = "Shortcut";
            }
            break;
        case (DOCUMENT_TYPE.QUESTION):
        case (DOCUMENT_TYPE.FAST_TRACK_QUESTION):
            title = generateQuestionTitle(item);
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
            icon = <img src={"/assets/cs/icons/concept.svg"} alt="Concept page icon"/>;
            if (isAda) {
                typeLabel = "Concept";
            }
            break;
        case (DOCUMENT_TYPE.EVENT):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.EVENT]}/${item.id}`;
            icon = <img src={"/assets/cs/icons/event.svg"} alt="Event page icon"/>;
            typeLabel = "Event";
            break;
        case (DOCUMENT_TYPE.TOPIC_SUMMARY):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.TOPIC_SUMMARY]}/${item.id?.slice("topic_summary_".length)}`;
            icon = <img src={"/assets/cs/icons/topic.svg"} alt="Topic summary page icon"/>;
            typeLabel = "Topic";
            break;
        case (DOCUMENT_TYPE.GENERIC):
            linkDestination = `/${documentTypePathPrefix[DOCUMENT_TYPE.GENERIC]}/${item.id}`;
            icon = <img src={"/assets/cs/icons/info-filled.svg"} alt="Generic page icon"/>;
            if (isAda) {
                typeLabel = "Info";
            }
            break;
        default:
            // Do not render this item if there is no matching DOCUMENT_TYPE
            console.error("Not able to display item as a ContentSummaryListGroupItem: ", item);
            return null;
    }

    return <ListGroupItem className={classNames(itemClasses)} data-bs-theme={itemSubject?.id} key={linkDestination}>
        <Link className={classNames({"position-relative justify-content-center": isAda})} to={{pathname: linkDestination, search: search, hash: hash}}>
            {contentTypeVisibility !== ContentTypeVisibility.FULLY_HIDDEN && <span className={classNames({"question-progress-icon": isAda})}>
                <div className={"inner-progress-icon"}>
                    {icon}
                    {contentTypeVisibility !== ContentTypeVisibility.ICON_ONLY && <>
                        <br/>
                        <span className={"icon-title"}>{typeLabel}</span>
                    </>}
                </div>
            </span>}
            <div className={classNames("flex-fill", {"py-3 pe-3 align-content-center": isAda, "d-flex": isAda && !stack})}>
                <div className={"align-self-center " + titleClasses}>
                    <div className="d-flex">
                        <Markup encoding={"latex"} className={classNames( "link-title question-link-title")}>
                            {title ?? ""}
                        </Markup>
                        <QuestionPropertyTags className="ms-2" supersededBy={item.supersededBy} tags={item.tags} />
                    </div>
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

                <div>
                    {audienceViews && audienceViews.length > 0 && <StageAndDifficultySummaryIcons audienceViews={audienceViews} stack={stack}/>}
                </div>
            </div>
            {isAda && !noCaret && <div className="list-caret align-content-center" aria-hidden="true">
                <i className="icon icon-chevron-right" aria-hidden="true"/>
            </div>}
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
