import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {myQuizzesCrumbs} from "./QuizAttemptComponent";
import {Alert} from "reactstrap";
import { getRTKQueryErrorMessage } from "../../../state";
import type {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import type {SerializedError} from "@reduxjs/toolkit";

type Error = FetchBaseQueryError | SerializedError | undefined;

export const buildErrorComponent = (title: string, heading: string) => function ErrorComponent(error: Error){
    return <>
        <TitleAndBreadcrumb currentPageTitle={title} intermediateCrumbs={myQuizzesCrumbs} />
        <Alert color="danger">
            <h4 className="alert-heading">{heading}</h4>
            <p data-testid="error-message">{getRTKQueryErrorMessage(error).message}</p>
        </Alert>
    </>;
};