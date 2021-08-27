import React from "react";

export interface ConceptGameboardButtonProps {
    conceptId?: string
}

export const ConceptGameboardButton = ({conceptId} : ConceptGameboardButtonProps) => {
    return <a role="button" className="btn btn-secondary" href={`/gameboards/from_concept?concepts=${conceptId}`} rel="noreferrer" target="_blank">
        Generate a gameboard
    </a>
}