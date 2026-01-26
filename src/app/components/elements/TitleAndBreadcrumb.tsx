import React, {ReactElement} from "react";
import {PageTitle, PageTitleProps, TitleMetadata, TitleMetadataProps} from "./PageTitle";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link} from "react-router-dom";
import {CollectionType, HOME_CRUMB, HUMAN_STAGES, HUMAN_SUBJECTS, isAda, isDefined, isPhy, isSingleStageContext, LinkInfo, siteSpecific} from "../../services";
import {Markup} from "./markup";
import classNames from "classnames";
import { PageContextState } from "../../../IsaacAppTypes";

interface BreadcrumbTrailProps {
    currentPageTitle: string;
    disallowLaTeX?: boolean;
    intermediateCrumbs?: LinkInfo[];
    collectionType?: CollectionType;
}

// BreadcrumbTrail has been pulled into TitleAndBreadcrumb so that it is the only place it is used.
// If you want to use it elsewhere, that is fine but you must consider the implications on the "Skip to main content"
// link which needs to skip all static navigational elements (i.e. breadcrumbs).
// We manage the ID of the "main content" with the mainContentId reducer.
const BreadcrumbTrail = ({currentPageTitle, intermediateCrumbs = [], collectionType, disallowLaTeX}:
                             BreadcrumbTrailProps) => {
    const breadcrumbHistory = siteSpecific([
        ...intermediateCrumbs,
    ].filter(isDefined),
    [
        HOME_CRUMB as LinkInfo, 
        ...intermediateCrumbs
    ]);

    return !!breadcrumbHistory.length && <Breadcrumb className={classNames("bread", siteSpecific("container-override py-2", "mb-3 mb-sm-1 mb-md-0 px-md-0 py-md-2"))}>
        {breadcrumbHistory.map((breadcrumb) => formatBreadcrumbHistoryItem(breadcrumb, disallowLaTeX))}
        {isAda && formatBreadcrumbItem(currentPageTitle, disallowLaTeX)}
    </Breadcrumb>;
};

export const formatBreadcrumbItemTitle = (title: string, disallowLaTeX?: boolean) => <Markup encoding={disallowLaTeX ? "plaintext" : "latex"}>{title}</Markup>;

export const formatBreadcrumbHistoryItem = (breadcrumb: LinkInfo, disallowLaTeX?: boolean) => {
    const titleElement = formatBreadcrumbItemTitle(breadcrumb.title, disallowLaTeX);

    return <BreadcrumbItem key={breadcrumb.title}>
        {breadcrumb.to ? <Link to={breadcrumb.to} replace={breadcrumb.replace} className="breadcrumb-link">{titleElement}</Link> : titleElement}
    </BreadcrumbItem>;
};

export const formatBreadcrumbItem = (currentPageTitle: string, disallowLaTeX?: boolean) => {
    return <BreadcrumbItem active>
        {formatBreadcrumbItemTitle(currentPageTitle, disallowLaTeX)}
    </BreadcrumbItem>;
};

type TitleAndBreadcrumbProps = BreadcrumbTrailProps & PageTitleProps & TitleMetadataProps & {
    breadcrumbTitleOverride?: string;
    children?: ReactElement | boolean;
    className?: string;
};

export const TitleAndBreadcrumb = ({children, breadcrumbTitleOverride, currentPageTitle, displayTitleOverride, subTitle, disallowLaTeX, className, audienceViews, help, collectionType, intermediateCrumbs, preview, icon}: TitleAndBreadcrumbProps) => {
    return <div id="page-title" className={classNames(className, "title-breadcrumb-container")}>
        {isPhy && <div className="title-graphics"/>}
        <BreadcrumbTrail
            currentPageTitle={breadcrumbTitleOverride ?? currentPageTitle}
            intermediateCrumbs={intermediateCrumbs}
            collectionType={collectionType}
        />
        {children}
        <div tabIndex={-1} className={classNames("d-sm-flex", {"py-2": isPhy, "mb-2": isAda})}>
            <PageTitle
                subTitle={subTitle} disallowLaTeX={disallowLaTeX}
                currentPageTitle={currentPageTitle} displayTitleOverride={displayTitleOverride}
                preview={preview} icon={icon}
            />
            <TitleMetadata audienceViews={audienceViews} help={help} />
        </div>
    </div>;
};

export const generateSubjectLandingPageCrumbFromContext = (pageContext: NonNullable<Required<PageContextState>>) : LinkInfo | undefined => {
    if (!isSingleStageContext(pageContext)) return;
    return pageContext.stage[0] in HUMAN_STAGES 
        ? {
            title: `${HUMAN_STAGES[pageContext.stage[0]]} ${HUMAN_SUBJECTS[pageContext.subject]}`,
            to: `/${pageContext.subject}/${pageContext.stage}`,
            replace: false
        }
        : undefined;
};
