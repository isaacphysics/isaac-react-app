import React from "react";
import {Spinner} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import classNames from "classnames";

export interface IsaacSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    color?: "primary" | "secondary"
}

// TODO: investigate and improve accessibility of both CS and default spinners. (The "Loading..." is copied from Bootstrap).
export const IsaacSpinner = ({size = "md", className, color = "primary"} : IsaacSpinnerProps) => {
    return SITE_SUBJECT === SITE.CS ?
        <div role="status" className="pb-1">
            <img className={classNames(`isaac-spinner-${size}`, className)} alt="" src="/assets/isaac-cs-typer-css.svg"/>
            <span className="sr-only">Loading...</span>
        </div>
        :
        <Spinner className={className} color={color} size={size}/>;
}
