import React from "react";
import {siteSpecific} from "../../services";
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
        <img style={siteSpecific({width: "auto", height: "5.5rem"}, {})} className={classNames(`isaac-spinner-${size}`, className)} alt="" src={siteSpecific("/assets/phy/isaac-phy-apple-grow.svg", "/assets/cs/icons/loading-spinner-placeholder.svg")}/>
        <span className="visually-hidden">{displayText}</span>
    </>;
    return inline
        ? <span role="status">{contents}</span>
        : <div role="status" className="pb-1">{contents}</div>;
};

export const Loading = ({noText, className, displayText}: {noText?: boolean; className?: string, displayText?: string}) =>
    <div className={classNames(className, "w-100 text-center pb-2")}>
        {!noText && <h2 aria-hidden="true" className="pt-5">{displayText ?? "Loading..."}</h2>}
        <IsaacSpinner />
    </div>;
