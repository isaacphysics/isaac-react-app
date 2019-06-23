import React from "react";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link} from "react-router-dom";
import {LinkInfo} from "../../../IsaacAppTypes";
import {HOME_CRUMB} from "../../services/constants";

export interface BreadcrumbTrailProps {
    currentPageTitle: string;
    intermediateCrumbs?: LinkInfo[];
}

export const BreadcrumbTrail = ({currentPageTitle, intermediateCrumbs = []}: BreadcrumbTrailProps) => {
    const breadcrumbHistory = [HOME_CRUMB].concat(intermediateCrumbs);
    return <Breadcrumb className="py-md-2 px-md-0 mb-3 mb-md-0 bread">
        {breadcrumbHistory.map((breadcrumb) => (
            <BreadcrumbItem key={breadcrumb.title}>
                <Link to={breadcrumb.to}>
                    {breadcrumb.title}
                </Link>
            </BreadcrumbItem>
        ))}
        <BreadcrumbItem active>
            {currentPageTitle}
        </BreadcrumbItem>
    </Breadcrumb>;
};
