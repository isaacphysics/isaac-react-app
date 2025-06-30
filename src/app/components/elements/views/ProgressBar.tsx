import React from 'react';
import {isDefined} from "../../../services";

interface ProgressBarProps {
    percentage: number;
    primaryTitle?: string;
    secondaryPercentage?: number;
    secondaryTitle?: string;
    children: string | JSX.Element | JSX.Element[];
    type?: string;
}

const BAR_COLOURS = new Map([
    ["phys_book_step_up", "bar-physics"],
    ["phys_book_gcse", "bar-physics"],
    ["physics_skills_14", "bar-physics"],
    ["physics_skills_19", "bar-physics"],
    ["physics_linking_concepts", "bar-physics"],
    ["maths_book_gcse", "bar-maths"],
    ["maths_book", "bar-maths"],
    ["maths_book_2e", "bar-maths"],
    ["chemistry_16", "bar-chemistry"]
]);

export const ProgressBar = ({percentage, primaryTitle, secondaryPercentage, secondaryTitle, children, type}: ProgressBarProps) => {
    const colour = type && BAR_COLOURS.get(type);
    return <div className="progress-bar-outer mb-2">
        {isDefined(secondaryPercentage) && <div className={`progress-bar-secondary ${colour}`} title={secondaryTitle} style={{width: `${secondaryPercentage}%`}} />}
        <div className={`progress-bar-inner ${colour}`} style={{width: `${percentage}%`}} title={primaryTitle}>
            <div className="ps-3 pt-1">
                {children}
            </div>
        </div>
    </div>;
};
