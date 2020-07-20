import React, {ReactElement} from "react";
import {BreadcrumbTrail, BreadcrumbTrailProps} from "./BreadcrumbTrail";
import {PageTitle, PageTitleProps} from "./PageTitle";

type TitleAndBreadcrumbProps = BreadcrumbTrailProps & PageTitleProps & {
    breadcrumbTitleOverride?: string;
    children?: ReactElement | boolean;
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
