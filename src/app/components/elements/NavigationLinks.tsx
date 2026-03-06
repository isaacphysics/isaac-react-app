import React from "react";
import {PageNavigation} from "../../services";
import {Link} from "react-router-dom";
import {Markup} from "./markup";
import classNames from "classnames";

export const NavigationLinks = ({navigation}: {navigation: PageNavigation}) => {
    const backToCollectionLink = navigation.backToCollection && <div className="w-50 w-md-auto mb-4">
        <Link to={navigation.backToCollection.to ?? ""} className="d-flex flex-column">
            <span className="float-start">{navigation.collectionType}:</span> {/* float removes the underline. css! */}
            <div className="lrg-text fw-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.backToCollection.title}</Markup>
            </div>
        </Link>
    </div>;

    const nextItemLink = navigation.nextItem && <div className="w-50 w-md-auto text-end mb-4">
        <Link to={{pathname: navigation.nextItem.to, search: navigation.search}} className="d-flex flex-column">
            <div className="lrg-text fw-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.nextItem.title}</Markup>
            </div>
            <div className="d-flex align-items-center gap-2 justify-content-end float-end">
                Next
                <i className="icon icon-arrow-right" aria-hidden="true"/>
            </div>
        </Link>
    </div>;

    const previousItemLink = navigation.previousItem && <div className="w-50 w-md-auto text-start mb-4">
        <Link to={{pathname: navigation.previousItem.to, search: navigation.search}} className="d-flex flex-column">
            <div className="lrg-text fw-bold">
                <Markup trusted-markup-encoding={"html"}>{navigation.previousItem.title}</Markup>
            </div>
            <div className="d-flex align-items-center gap-2 float-start">
                <i className="icon icon-arrow-left" aria-hidden="true"/>
                Previous
            </div>
        </Link>
    </div>;

    const anyLinks = [previousItemLink, backToCollectionLink, nextItemLink].filter(l => l).length > 0;
    const threeLinks = [previousItemLink, backToCollectionLink, nextItemLink].filter(l => l).length === 3;

    return anyLinks && <>
        <div className="section-divider my-4"/>
        <div className="d-flex justify-content-between align-items-stretch no-print">
            {previousItemLink}
            <span className={classNames({"d-none d-xl-block": threeLinks})}>{backToCollectionLink}</span>
            {nextItemLink}
        </div>
        <div className={classNames("no-print", {"d-block d-xl-none": threeLinks, "d-none": !threeLinks})}>
            {backToCollectionLink}
        </div>
        <div className="only-print">
            {backToCollectionLink}
        </div>
    </>;
};
