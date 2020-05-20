import React, {ReactElement, useEffect, useRef} from "react";
import {UncontrolledTooltip} from "reactstrap";
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {TrustedHtml} from "./TrustedHtml";

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    help?: string | ReactElement;
    className?: string;
    level?: number;
}

export const PageTitle = ({currentPageTitle, subTitle, help, className, level}: PageTitleProps) => {
    const headerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        document.title = currentPageTitle + " — Isaac " + SITE_SUBJECT_TITLE;
        const element = headerRef.current;
        if (element && (window as any).followedAtLeastOneSoftLink) {
            element.focus();
        }
    }, [currentPageTitle]);

    return <h1 id="main-heading" tabIndex={-1} ref={headerRef} className={`h-title h-secondary${className ? ` ${className}` : ""}`}>
        <TrustedHtml span html={currentPageTitle} />
        {SITE_SUBJECT === SITE.PHY && level !== undefined && level !== 0 &&
            <span className="float-right h-subtitle">Level {level}</span>}
        {help && <span id="title-help">Help</span>}
        {help && <UncontrolledTooltip target="#title-help" placement="bottom">{help}</UncontrolledTooltip>}
        {subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
    </h1>
};
