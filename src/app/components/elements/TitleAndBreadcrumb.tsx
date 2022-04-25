import React, {ReactElement} from "react";
import {PageTitle, PageTitleProps} from "./PageTitle";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link} from "react-router-dom";
import {HOME_CRUMB} from "../../services/constants";
import {CollectionType, LinkInfo} from "../../services/navigation";
import {LaTeX} from "./LaTeX";

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
    const breadcrumbHistory = [HOME_CRUMB as LinkInfo, ...intermediateCrumbs];

    // Copy and mask collection type title
    if (collectionType === "Gameboard") {
        const collectionBreadcrumb = breadcrumbHistory.splice(1, 1)[0];
        breadcrumbHistory.splice(1, 0,
            Object.assign({}, collectionBreadcrumb, {title: collectionType}));
    }

    return <Breadcrumb className="py-md-2 px-md-0 mb-3 mb-md-0 bread">
        {breadcrumbHistory.map((breadcrumb) => formatBreadcrumbHistoryItem(breadcrumb, disallowLaTeX))}
        {formatBreadcrumbItem(currentPageTitle, disallowLaTeX)}
    </Breadcrumb>;
};

export const formatBreadcrumbItemTitle = (title: string, disallowLaTeX?: boolean) => {
    return disallowLaTeX ? <span> {title} </span> : <LaTeX markup={title} />
}

export const formatBreadcrumbHistoryItem = (breadcrumb: LinkInfo, disallowLaTeX?: boolean) => {
    const titleElement = formatBreadcrumbItemTitle(breadcrumb.title, disallowLaTeX)

    return <BreadcrumbItem key={breadcrumb.title}>
        {breadcrumb.to ? <Link to={breadcrumb.to} replace={breadcrumb.replace}>{titleElement}</Link> : titleElement}
    </BreadcrumbItem>
}

export const formatBreadcrumbItem = (currentPageTitle: string, disallowLaTeX?: boolean) => {
    return <BreadcrumbItem active>
        {formatBreadcrumbItemTitle(currentPageTitle, disallowLaTeX)}
    </BreadcrumbItem>
}

type TitleAndBreadcrumbProps = BreadcrumbTrailProps & PageTitleProps & {
    breadcrumbTitleOverride?: string;
    children?: ReactElement | boolean;
    modalId?: string;
};

export const TitleAndBreadcrumb = (props: TitleAndBreadcrumbProps) => {
    const breadcrumbProps = {...props, className: undefined};
    if (props.breadcrumbTitleOverride) {
        breadcrumbProps.currentPageTitle = props.breadcrumbTitleOverride;
    }
    return <React.Fragment>
        <BreadcrumbTrail {...breadcrumbProps} />
        {props.children}
        <PageTitle {...props} />
    </React.Fragment>;
};
