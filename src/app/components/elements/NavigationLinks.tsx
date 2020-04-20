import React from "react";
import {PageNavigation} from "../../services/navigation";
import {Link} from "react-router-dom";

export const NavigationLinks = ({navigation}: {navigation: PageNavigation}) => {
    const backToCollectionLink = navigation.backToCollection && <div className="w-50 w-md-auto mb-4">
        <Link to={navigation.backToCollection.to}>
            <div className="isaac-nav-link text-decoration-none">{navigation.collectionType}:</div>
            <div className="isaac-nav-link a-alt d-block lrg-text text-dark font-weight-bold">{navigation.backToCollection.title}</div>
        </Link>
    </div>;

    const nextItemLink = navigation.nextItem && <div className="w-50 w-md-auto text-right mb-4">
        <Link to={{pathname: navigation.nextItem.to, search: navigation.queryParams}}>
            <div className="isaac-nav-link float-right a-alt lrg-text font-weight-bold">{navigation.nextItem.title}</div>
            <div className="isaac-nav-link float-right  next-link">Next</div>
        </Link>
    </div>;

    return <div className="mt-4 d-flex justify-content-between align-items-stretch no-print">
        {backToCollectionLink}
        {nextItemLink}
    </div>
};
