import React, {ReactElement} from "react";
import {UncontrolledTooltip} from "reactstrap";

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    help?: string | ReactElement;
}

export const PageTitle = ({currentPageTitle, subTitle, help}: PageTitleProps) => {
    return <h1 className="h-title h-secondary">
        {currentPageTitle}
        {help && <h4 id="title-help">Help</h4>}
        {help && <UncontrolledTooltip target="#title-help">{help}</UncontrolledTooltip>}
        {subTitle && <h5 className="d-none d-sm-block">{subTitle}</h5>}
    </h1>
};
