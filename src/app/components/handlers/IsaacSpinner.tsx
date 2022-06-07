import React from "react";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import classNames from "classnames";

export interface IsaacSpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
    color?: "primary" | "secondary"
}

// TODO: investigate and improve accessibility of both CS and default spinners. (The "Loading..." is copied from Bootstrap).
export const IsaacSpinner = ({size = "md", className, color = "primary"} : IsaacSpinnerProps) => {
    return <div role="status" className="pb-1">
        <img style={SITE_SUBJECT === SITE.PHY ? {width: "auto", height: "5.5rem"} : {}} className={classNames(`isaac-spinner-${size}`, className)} alt="" src={SITE_SUBJECT === SITE.CS ? "/assets/isaac-cs-typer-css.svg" : "/assets/isaac-phy-apple-grow.svg"}/>
        <span className="sr-only">Loading...</span>
    </div>
};

export const Loading = () => <div className="w-100 text-center pb-2">
    <h2 aria-hidden="true" className="pt-5">Loading...</h2>
    <IsaacSpinner />
</div>;
