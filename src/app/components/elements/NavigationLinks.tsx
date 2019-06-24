import React from "react";
import {PageNavigation} from "../../services/navigation";
import {Link} from "react-router-dom";

export const NavigationLinks = ({navigation}: {navigation: PageNavigation}) => {
    const backToCollectionLink = navigation.backToCollection && <div className="float-left">
        <Link to={navigation.backToCollection.to} className="text-decoration-none">
            {navigation.collectionType}:
        </Link>
        <Link to={navigation.backToCollection.to} className="a-alt d-block lrg-text text-dark font-weight-bold mb-5">
            {navigation.backToCollection.title}
        </Link>
    </div>;

    const nextItemLink = navigation.nextItem && <React.Fragment>
        <Link to={{pathname: navigation.nextItem.to, search: navigation.queryParams}} className="a-alt lrg-text float-right font-weight-bold">
            {navigation.nextItem.title}
        </Link>
        <Link to={{pathname: navigation.nextItem.to, search: navigation.queryParams}} className="mb-5 next-link float-right">
            Next
        </Link>
    </React.Fragment>;

    return <React.Fragment>
        {backToCollectionLink}
        {nextItemLink}
    </React.Fragment>
};
