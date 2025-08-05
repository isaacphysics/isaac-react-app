import React from "react";
import { Card, CardHeader } from "reactstrap";
import { siteSpecific } from "../../services";


export const ResultsListContainer = ({children}: {children: React.ReactNode}) => {
    return siteSpecific(
        <div className="list-results-container p-2 my-4">{children}</div>,
        <Card>{children}</Card>
    );
};

export const ResultsListHeader = ({children}: {children: React.ReactNode}) => {
    return siteSpecific(
        <div className="px-2 py-3">{children}</div>,
        <CardHeader className="finder-header py-2">{children}</CardHeader>
    );
};
