import React from 'react';

interface ProgressBarProps {
    percentage: number;
    children: string;
    targetAchieved?: boolean;
}

export const ProgressBar = (props: ProgressBarProps) => {
    const {percentage, children, targetAchieved=false} = props;

    return <div className="progress-bar-outer mb-2">
        <div className={`progress-bar-inner ${targetAchieved ? "bg-success" : ""}`} style={{width: `${percentage}%`}}>
            <span className={"pl-2"}>{children}</span>
        </div>
    </div>
};
