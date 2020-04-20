import React from "react";
import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Link} from "react-router-dom";
import {HOME_CRUMB} from "../../services/constants";
import {CollectionType, LinkInfo} from "../../services/navigation";

export interface BreadcrumbTrailProps {
    currentPageTitle: string;
    intermediateCrumbs?: LinkInfo[];
    collectionType?: CollectionType;
}

export const BreadcrumbTrail = ({currentPageTitle, intermediateCrumbs = [], collectionType}: BreadcrumbTrailProps) => {
    const breadcrumbHistory = [HOME_CRUMB, ...intermediateCrumbs];

    // Copy and mask collection type title
    if (collectionType === "Gameboard") {
        const collectionBreadcrumb = breadcrumbHistory.splice(1, 1)[0];
        breadcrumbHistory.splice(1, 0,
            Object.assign({}, collectionBreadcrumb, {title: collectionType}));
    }

    return <Breadcrumb className="py-md-2 px-md-0 mb-3 mb-md-0 bread">
        {breadcrumbHistory.map((breadcrumb) => (
            <BreadcrumbItem key={breadcrumb.title}>
                {breadcrumb.to ?
                    <Link to={breadcrumb.to}>
                        {breadcrumb.title}
                    </Link>
                    : breadcrumb.title
                }
            </BreadcrumbItem>
        ))}
        <BreadcrumbItem active>
            {currentPageTitle}
        </BreadcrumbItem>
    </Breadcrumb>;
};
