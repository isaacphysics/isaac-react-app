import React from "react";
import {TitleAndBreadcrumb} from "../TitleAndBreadcrumb";
import {Alert} from "reactstrap";
import { getRTKQueryErrorMessage } from "../../../state";
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import type {SerializedError} from "@reduxjs/toolkit";
import { LinkInfo } from "../../../services";

type Error = FetchBaseQueryError | SerializedError | undefined;

export const buildErrorComponent = (title: string, heading: string, breadcrumbs: LinkInfo[]) => function ErrorComponent(error: Error){
    return <>
        <TitleAndBreadcrumb currentPageTitle={title} intermediateCrumbs={breadcrumbs} />
        <Alert color="danger">
            <h4 className="alert-heading">{heading}</h4>
            <p data-testid="error-message">{getRTKQueryErrorMessage(error).message}</p>
        </Alert>
    </>;
};