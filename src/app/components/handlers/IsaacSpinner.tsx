import React from "react";
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
    const styling = classNames(className, 'spinner-border', `isaac-spinner-${size}`)
    const sr = <span className="sr-only">{displayText}</span>
     
    return inline
        ? <span role="status" className={styling}>{sr}</span>
        : <div role="status" className={`${styling} pb-1`}>{sr}</div>;
};

export const Loading = ({ noText }: { noText?: boolean }) => (
  <div className="w-100 text-center pb-2">
    {!noText && (
      <h2 data-testid="loading-spinner" aria-hidden="true" className="pt-5">
        Loading...
      </h2>
    )}
    <IsaacSpinner />
  </div>
);