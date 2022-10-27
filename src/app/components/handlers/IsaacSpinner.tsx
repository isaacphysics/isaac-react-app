import React from "react";
import {isCS, siteSpecific} from "../../services";
import classNames from "classnames";

export interface IsaacSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    color?: "primary" | "secondary";
    inline?: boolean;
    displayText?: string;
}

// TODO: investigate and improve accessibility of both CS and default spinners. (The "Loading..." is copied from Bootstrap).
export const IsaacSpinner = ({size = "md", className, color = "primary", inline = false, displayText = "Loading..."} : IsaacSpinnerProps) => {
    const contents = <>
        <img style={siteSpecific({width: "auto", height: "5.5rem"}, {})} className={classNames(`isaac-spinner-${size}`, className)} alt="" src={isCS ? "/assets/isaac-cs-typer-css.svg" : "/assets/isaac-phy-apple-grow.svg"}/>
        <span className="sr-only">{displayText}</span>
    </>;
    return inline
        ? <span role="status">{contents}</span>
        : <div role="status" className="pb-1">{contents}</div>;
};

export const Loading = ({noText}: {noText?: boolean}) => <div className="w-100 text-center pb-2">
    {!noText && <h2 aria-hidden="true" className="pt-5">Loading...</h2>}
    <IsaacSpinner />
</div>;
