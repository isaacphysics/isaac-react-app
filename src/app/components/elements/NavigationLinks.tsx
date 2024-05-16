import React from "react";
import {PageNavigation} from "../../services";
import {Link} from "react-router-dom";
import {Markup} from "./markup";

export const NavigationLinks = ({navigation}: {navigation: PageNavigation}) => {
    const backToCollectionLink = navigation.backToCollection && <div className="w-50 w-md-auto mb-4">
        <Link to={navigation.backToCollection.to ?? ""}>
            <div className="isaac-nav-link text-decoration-none">{navigation.collectionType}:</div>
            <div className="isaac-nav-link a-alt d-block lrg-text text-dark font-weight-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.backToCollection.title}</Markup>
            </div>
        </Link>
    </div>;

    const nextItemLink = navigation.nextItem && <div className="w-50 w-md-auto text-right mb-4">
        <Link to={{pathname: navigation.nextItem.to, search: navigation.search}}>
            <div className="isaac-nav-link float-right a-alt lrg-text font-weight-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.nextItem.title}</Markup>
            </div>
            <div className="isaac-nav-link float-right next-link">Next</div>
        </Link>
    </div>;

    const previousItemLink = navigation.previousItem && <div className="w-50 w-md-auto text-left mb-4">
        <Link to={{pathname: navigation.previousItem.to, search: navigation.search}}>
            <div className="isaac-nav-link float-start a-alt lrg-text font-weight-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.previousItem.title}</Markup>
            </div>
            <div className="isaac-nav-link float-start previous-link">Previous</div>
        </Link>
    </div>;

    const threeLinks = [previousItemLink, backToCollectionLink, nextItemLink].filter(l => l).length === 3;

    return <>
        <div className="mt-4 d-flex justify-content-between align-items-stretch no-print">
            {previousItemLink}
            <span className={threeLinks ? "d-none d-xl-block" : ""}>{backToCollectionLink}</span>
            {nextItemLink}
        </div>
        {threeLinks && <div className="d-xl-none">
            {backToCollectionLink}
        </div>}
    </>
};
