import React from "react";
import {BreadcrumbTrailProps, BreadcrumbTrail} from "./BreadcrumbTrail";
import {PageTitleProps, PageTitle} from "./PageTitle";

type TitleAndBreadcrumbProps = BreadcrumbTrailProps & PageTitleProps & {
    breadcrumbTitleOverride?: string;
};

export const TitleAndBreadcrumb = (props: TitleAndBreadcrumbProps) => {
    const breadcrumbProps = {...props, className: undefined};
    if (props.breadcrumbTitleOverride) {
        breadcrumbProps.currentPageTitle = props.breadcrumbTitleOverride;
    }
    return <React.Fragment>
        <BreadcrumbTrail {...breadcrumbProps} />
        <PageTitle {...props} />
    </React.Fragment>;
};
