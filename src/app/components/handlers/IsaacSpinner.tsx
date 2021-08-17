import React from "react";
import {Spinner} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

export interface IsaacSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    color?: "primary" | "secondary"
}

export const IsaacSpinner = ({size = "md", className, color = "primary"} : IsaacSpinnerProps) => {
    return SITE_SUBJECT === SITE.CS ?
        <img className={`isaac-spinner-${size} ` + className} alt="Isaac Computer Science loading spinner" src="/assets/isaac-cs-typer-css.svg"/>
        :
        <Spinner className={className} color={color} size={size}/>;
}
