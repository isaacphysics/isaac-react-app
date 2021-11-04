import React from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {Link} from "react-router-dom";

export interface ConceptGameboardButtonProps {
    className?: string;
    conceptId?: string;
}
// role="button" className={`btn btn-secondary ${className}`}
export const ConceptGameboardButton = ({conceptId, className} : ConceptGameboardButtonProps) => {

    // Currently PHY doesn't use this
    const gameboardGenerateHref = {
        [SITE.PHY]: `/gameboard_builder?concepts=${conceptId}`,
        [SITE.CS]: `/gameboard_builder?concepts=${conceptId}`
    }[SITE_SUBJECT]

    return <Link className={className} to={gameboardGenerateHref} >
        Generate a gameboard
    </Link>
}
