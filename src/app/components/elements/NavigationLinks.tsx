import React from "react";
import {PageNavigation} from "../../services/navigation";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";

export const NavigationLinks = ({navigation}: {navigation: PageNavigation}) => {
    const backToCollectionLink = navigation.backToCollection && <div className="w-50 w-md-auto">
        <Link to={navigation.backToCollection.to} className="text-decoration-none">
            {navigation.collectionType}:
        </Link>
        <Link to={navigation.backToCollection.to} className="a-alt d-block lrg-text text-dark font-weight-bold mb-4">
            {navigation.backToCollection.title}
        </Link>
    </div>;

    const nextItemLink = navigation.nextItem && <div className="w-50 w-md-auto text-right">
        <Link to={{pathname: navigation.nextItem.to, search: navigation.queryParams}} className="a-alt lrg-text float-right font-weight-bold">
            {navigation.nextItem.title}
        </Link>
        <Link to={{pathname: navigation.nextItem.to, search: navigation.queryParams}} className="next-link float-right mb-4">
            Next
        </Link>
    </div>;

    return <div className="mt-4 d-flex justify-content-between align-items-stretch">
        {backToCollectionLink}
        {nextItemLink}
    </div>
};
