import React from 'react';

interface ProgressBarProps {
    percentage: number;
    children: string;
}

export const ProgressBar = ({percentage, children}: ProgressBarProps) => {
    return <div className="progress-bar-outer mb-2">
        <div className="progress-bar-inner" style={{width: `${percentage}%`}}>
            <span className="pl-3">
                {children}
            </span>
        </div>
    </div>
};
