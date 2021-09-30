import React from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

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

    return <a className={className} href={gameboardGenerateHref} rel="noreferrer" target="_blank">
        Generate a gameboard
    </a>
}
