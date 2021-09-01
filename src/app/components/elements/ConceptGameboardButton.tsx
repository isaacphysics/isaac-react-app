import React from "react";

export interface ConceptGameboardButtonProps {
    className?: string;
    conceptId?: string;
}
// role="button" className={`btn btn-secondary ${className}`}
export const ConceptGameboardButton = ({conceptId, className} : ConceptGameboardButtonProps) => {
    return <a className={className} href={`/gameboards/from_concept?concepts=${conceptId}`} rel="noreferrer" target="_blank">
        Generate a gameboard
    </a>
}