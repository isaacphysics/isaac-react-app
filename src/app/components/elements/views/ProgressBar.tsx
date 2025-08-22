import React from 'react';
import {isDefined} from "../../../services";
import classNames from 'classnames';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    percentage: number;
    primaryTitle?: string;
    secondaryPercentage?: number;
    secondaryTitle?: string;
    children?: string | JSX.Element | JSX.Element[];
    type?: string;
    thin?: boolean;
    rounded?: boolean;
}

const BAR_COLOURS: Record<string, string> = {
    "phys_book_step_up": "bar-physics",
    "phys_book_gcse": "bar-physics",
    "physics_skills_14": "bar-physics",
    "physics_skills_19": "bar-physics",
    "physics_linking_concepts": "bar-physics",
    "maths_book_gcse": "bar-maths",
    "maths_book": "bar-maths",
    "maths_book_2e": "bar-maths",
    "chemistry_16": "bar-chemistry",

    "ada-primary": "bar-ada-primary"
};

export const ProgressBar = ({percentage, primaryTitle, secondaryPercentage, secondaryTitle, children, type, thin, rounded, ...rest}: ProgressBarProps) => {
    const colour = type && BAR_COLOURS[type];
    return <div {...rest} className={classNames("progress-bar-outer", {"thin": thin}, rest.className)}>
        {isDefined(secondaryPercentage) && <div className={`progress-bar-secondary ${colour}`} title={secondaryTitle} style={{width: `${secondaryPercentage}%`}} />}
        <div className={classNames("progress-bar-inner", colour, {"rounded-pill": rounded})} style={{width: `${percentage}%`}} title={primaryTitle}>
            {children && <div className="ps-3 pt-1">
                {children}
            </div>}
        </div>
    </div>;
};
