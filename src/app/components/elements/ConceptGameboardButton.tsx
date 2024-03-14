import React from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {PATHS, siteSpecific} from "../../services";

export interface ConceptGameboardButtonProps {
    className?: string;
    conceptId?: string;
}

// Currently PHY doesn't use this
export const ConceptGameboardButton = ({conceptId, className} : ConceptGameboardButtonProps) => {
    return <Link className={classNames(className, "btn btn-sm btn-primary")} to={`${PATHS.GAMEBOARD_BUILDER}?concepts=${conceptId}`} >
        Generate a {siteSpecific("gameboard", "quiz")}
    </Link>;
};
