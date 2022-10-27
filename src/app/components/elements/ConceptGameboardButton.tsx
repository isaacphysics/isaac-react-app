import React from "react";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {siteSpecific} from "../../services";

export interface ConceptGameboardButtonProps {
    className?: string;
    conceptId?: string;
}

export const ConceptGameboardButton = ({conceptId, className} : ConceptGameboardButtonProps) => {

    // Currently PHY doesn't use this
    const gameboardGenerateHref = siteSpecific(
        `/gameboard_builder?concepts=${conceptId}`,
        `/gameboard_builder?concepts=${conceptId}`
    );

    return <Link className={classNames(className, "btn btn-sm btn-primary")} to={gameboardGenerateHref} >
        Generate a gameboard
    </Link>
}
