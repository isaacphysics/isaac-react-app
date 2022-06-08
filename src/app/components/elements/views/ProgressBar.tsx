import React from 'react';
import {isDefined} from "../../../services/miscUtils";

interface ProgressBarProps {
    percentage: number;
    primaryTitle?: string;
    secondaryPercentage?: number;
    secondaryTitle?: string;
    children: string | JSX.Element | JSX.Element[];
    type?: string;
}

const BAR_COLOURS = new Map([
    ["maths_book", "bar-maths"],
    ["physics_skills_14", "bar-alevel"],
    ["physics_skills_19", "bar-alevel"],
    ["phys_book_gcse", "bar-gcse"],
    ["chemistry_16", "bar-chemistry"],
]);

export const ProgressBar = ({percentage, primaryTitle, secondaryPercentage, secondaryTitle, children, type}: ProgressBarProps) => {
    let colour = type && BAR_COLOURS.get(type);
    return <div className="progress-bar-outer mb-2">
        {isDefined(secondaryPercentage) && <div className={`progress-bar-secondary ${colour}`} title={secondaryTitle} style={{width: `${secondaryPercentage}%`}} />}
        <div className={`progress-bar-inner ${colour}`} style={{width: `${percentage}%`}} title={primaryTitle}>
            <span className="pl-3">
                {children}
            </span>
        </div>
    </div>
};
