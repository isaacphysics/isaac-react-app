import React from 'react';

interface ProgressBarProps {
    percentage: number;
    description: string;
}

export const ProgressBar = (props: ProgressBarProps) => {
    const {percentage, description} = props;

    return <div className="progress-bar-outer mb-2">
        <div className="progress-bar-inner" style={{width: `${percentage}%`}}>
            <span className={"pl-2"}>{description}</span>
        </div>
    </div>
};
