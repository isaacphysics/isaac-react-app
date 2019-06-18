import React from "react";
import {BreadcrumbTrailProps, BreadcrumbTrail} from "./BreadcrumbTrail";
import {PageTitleProps, PageTitle} from "./PageTitle";

type TitleAndBreadcrumbProps = BreadcrumbTrailProps & PageTitleProps & {
    breadcrumbTitleOverride?: string;
};

export const TitleAndBreadcrumb = (props: TitleAndBreadcrumbProps) => {
    let breadcrumbProps = props;
    if (props.breadcrumbTitleOverride) {
        breadcrumbProps = {...props, currentPageTitle: props.breadcrumbTitleOverride};
    }
    return <React.Fragment>
        <BreadcrumbTrail {...breadcrumbProps} />
        <PageTitle {...props} />
    </React.Fragment>;
};
