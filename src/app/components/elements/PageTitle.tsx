import React, {ReactElement, useEffect, useRef} from "react";
import {UncontrolledTooltip} from "reactstrap";

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    help?: string | ReactElement;
    className?: string;
}

export const PageTitle = ({currentPageTitle, subTitle, help, className}: PageTitleProps) => {
    const headerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        document.title = currentPageTitle + " — Isaac Computer Science";
        const element = headerRef.current;
        if (element) {
            element.focus();
        }
    }, [currentPageTitle]);

    return <h1 id="main-heading" tabIndex={-1} ref={headerRef} className={`h-title h-secondary${className ? ` ${className}` : ""}`}>
        {currentPageTitle}
        {help && <span id="title-help">Help</span>}
        {help && <UncontrolledTooltip target="#title-help">{help}</UncontrolledTooltip>}
        {subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
    </h1>
};
