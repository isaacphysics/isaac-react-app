import React from "react";
import { isDefined } from "../../../services";

interface ProgressBarProps {
  percentage: number;
  primaryTitle?: string;
  secondaryPercentage?: number;
  secondaryTitle?: string;
  children: string | JSX.Element | JSX.Element[];
  colour?: string;
}

export const ProgressBar = ({
  percentage,
  primaryTitle,
  secondaryPercentage,
  secondaryTitle,
  children,
  colour,
}: ProgressBarProps) => {
  return (
    <div className="progress-bar-outer mb-2">
      {isDefined(secondaryPercentage) && (
        <div
          className={`progress-bar-secondary ${colour}`}
          title={secondaryTitle}
          style={{ width: `${secondaryPercentage}%` }}
        />
      )}
      <div className={`progress-bar-inner ${colour}`} style={{ width: `${percentage}%` }} title={primaryTitle}>
        <span className="pl-3">{children}</span>
      </div>
    </div>
  );
};
