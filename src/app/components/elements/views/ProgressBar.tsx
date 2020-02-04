import React from 'react';

interface ProgressBarProps {
    percentage: number;
    children: string;
}

export const ProgressBar = (props: ProgressBarProps) => {
    const {percentage, children} = props;

    return <div className="progress-bar-outer mb-2">
        <div className="progress-bar-inner" style={{width: `${percentage}%`}}>
            <span className={"pl-2"}>{children}</span>
        </div>
    </div>
};
