import React from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {Link} from "react-router-dom";

export interface ConceptGameboardButtonProps {
    className?: string;
    conceptId?: string;
}
// role="button" className={`btn btn-secondary ${className}`}
export const ConceptGameboardButton = ({conceptId, className} : ConceptGameboardButtonProps) => {

    const gameboardGenerateHref = {
        [SITE.PHY]: `/gameboards/new?concepts=${conceptId}`,
        [SITE.CS]: `/gameboards/from_concept?concepts=${conceptId}`
    }[SITE_SUBJECT]

    return <Link className={className} to={gameboardGenerateHref} >
        Generate a gameboard
    </Link>
}
