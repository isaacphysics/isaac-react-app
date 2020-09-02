import React from 'react';

interface ProgressBarProps {
    percentage: number;
    children: string;
    type?: string;
}

const BAR_COLOURS = new Map([
    ["maths_book", "bar-maths"],
    ["physics_skills_14", "bar-alevel"],
    ["physics_skills_19", "bar-alevel"],
    ["phys_book_gcse", "bar-gcse"],
    ["chemistry_16", "bar-chemistry"],
]);

export const ProgressBar = ({percentage, children, type}: ProgressBarProps) => {
    let colour = type && BAR_COLOURS.get(type);
    return <div className="progress-bar-outer mb-2">
        <div className={`progress-bar-inner ${colour}`} style={{width: `${percentage}%`}}>
            <span className="pl-3">
                {children}
            </span>
        </div>
    </div>
};
