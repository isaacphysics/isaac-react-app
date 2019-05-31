import React from "react";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link} from "react-router-dom";
import {LinkInfo} from "../../../IsaacAppTypes";

interface BreadcrumbTrailProps {
    currentPageTitle: string;
    intermediateCrumbs?: LinkInfo[];
}

export const BreadcrumbTrail = ({currentPageTitle, intermediateCrumbs = []}: BreadcrumbTrailProps) => {
    const breadcrumbHistory = [{title: "Home", to: "/"}].concat(intermediateCrumbs);
    return <Breadcrumb className="py-2 px-0">
        {breadcrumbHistory.map((breadcrumb) => (
            <BreadcrumbItem key={breadcrumb.title}>
                <Link to={breadcrumb.to}>{breadcrumb.title}</Link>
            </BreadcrumbItem>
        ))}
        <BreadcrumbItem active>
            {currentPageTitle}
        </BreadcrumbItem>
    </Breadcrumb>;
};
