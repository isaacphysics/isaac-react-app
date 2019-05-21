import React from "react";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {withRouter} from "react-router-dom";

interface BreadcrumbTrailProps {
    location: {pathname: string};
    currentPageTitle: string;
}

const BreadcrumbTrailBase = ({location: pathname, currentPageTitle}: BreadcrumbTrailProps) => {
    // TODO breadcrumb logic depending on location, history and params etc.

    return <Breadcrumb className="py-2 px-0">
        <BreadcrumbItem active>
            <a href="/">Home</a>
        </BreadcrumbItem>
        <BreadcrumbItem active>
            {currentPageTitle}
        </BreadcrumbItem>
    </Breadcrumb>;
};

export const BreadcrumbTrail = withRouter(BreadcrumbTrailBase);
