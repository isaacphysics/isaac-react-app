import React from "react";
import { Card, CardHeader } from "reactstrap";
import { siteSpecific } from "../../services";
import classNames from "classnames";


export const ResultsListContainer = ({children, className, ...rest}: React.HTMLAttributes<HTMLElement>) => {
    return siteSpecific(
        <div {...rest} className={classNames("list-results-container p-2 my-4")}>{children}</div>,
        <Card {...rest} className={className}>{children}</Card>
    );
};

export const ResultsListHeader = ({children, className, ...rest}: React.HTMLAttributes<HTMLElement>) => {
    return siteSpecific(
        <div {...rest} className={classNames("px-2 py-3", className)}>{children}</div>,
        <CardHeader {...rest} className={classNames("finder-header py-2", className)}>{children}</CardHeader>
    );
};
