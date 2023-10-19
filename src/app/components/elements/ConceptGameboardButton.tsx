import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

export interface ConceptGameboardButtonProps {
  className?: string;
  conceptId?: string;
}

export const ConceptGameboardButton = ({ conceptId, className }: ConceptGameboardButtonProps) => {
  const gameboardGenerateHref = `/gameboard_builder?concepts=${conceptId}`;

  return (
    <Link className={classNames(className, "btn btn-sm btn-primary")} to={gameboardGenerateHref}>
      Generate a gameboard
    </Link>
  );
};
