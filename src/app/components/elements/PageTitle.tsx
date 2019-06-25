import React, {ReactElement, useEffect} from "react";
import {UncontrolledTooltip} from "reactstrap";

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    help?: string | ReactElement;
    className?: string;
}

export const PageTitle = ({currentPageTitle, subTitle, help, className}: PageTitleProps) => {
    useEffect(() => {
        document.title = currentPageTitle + " — Isaac Computer Science";
    }, [currentPageTitle]);

    return <h1 className={`h-title h-secondary${className ? ` ${className}` : ""}`}>
        {currentPageTitle}
        {help && <span id="title-help">Help</span>}
        {help && <UncontrolledTooltip target="#title-help">{help}</UncontrolledTooltip>}
        {subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
    </h1>
};
