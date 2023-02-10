import React from "react";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";
import {IsaacSpinner} from "./IsaacSpinner";
import {isDefined, isFound, NO_CONTENT, NOT_FOUND, SITE_TITLE, WEBMASTER_EMAIL} from "../../services";
import {getRTKQueryErrorMessage} from "../../state";
import {Alert} from "reactstrap";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";

const loadingPlaceholder = <div className="w-100 text-center pb-2">
    <h2 aria-hidden="true" className="pt-5">Loading...</h2>
    <IsaacSpinner />
</div>;

export const DefaultQueryError = ({error, title}: {error?: FetchBaseQueryError | SerializedError, title: string}) => {
    const errorDetails = getRTKQueryErrorMessage(error);
    return <Alert color={"warning"} className={"my-2"}>
        {title ?? "Error fetching data from server"}: {errorDetails.message}
        {errorDetails.status ? <><br/>Status code: {errorDetails.status}</> : ""}
        <br/>
        You may want to refresh the page, or <a href={`mailto:${WEBMASTER_EMAIL}`}>email</a> us if
        this continues to happen.
        Please include in your email the name and email associated with this
        {SITE_TITLE} account, alongside the details of the error given above.
    </Alert>;
};

interface ShowLoadingQueryInfo<T> {
    data?: T | NOT_FOUND_TYPE;
    isLoading: boolean;
    isError: boolean;
    error?: FetchBaseQueryError | SerializedError;
}
// The Error and loading data of the first query take precedence over the second one
export function combineQueries<T, R, S>(firstQuery: ShowLoadingQueryInfo<T>, secondQuery: ShowLoadingQueryInfo<R>, combineResult: (firstQueryResult: NonNullable<T>, secondQueryResult: NonNullable<R>) => NonNullable<S>): ShowLoadingQueryInfo<S> {
    return {
        data: isFound<T>(firstQuery.data) && isFound<R>(secondQuery.data) ? combineResult(firstQuery.data, secondQuery.data) : undefined,
        isLoading: firstQuery.isLoading || secondQuery.isLoading,
        isError: firstQuery.isError || secondQuery.isError,
        error: firstQuery.error ?? secondQuery.error,
    };
}
// Convenience function to get both results out of a combine query
export const pairResults = <T, R>(first: T, second: R): [T, R] => [first, second];
// Convenience function to discard the results of a combine query. Result value must be truthy so the combined query is
// considered "successful"
export const discardResults = (): true => true;

interface ShowLoadingQueryBaseProps<T> {
    placeholder?: JSX.Element | JSX.Element[];
    query: ShowLoadingQueryInfo<T>;
    ifNotFound?: JSX.Element | JSX.Element[];
}
type ShowLoadingQueryErrorProps<T> = ShowLoadingQueryBaseProps<T> & ({
    ifError: (error?: FetchBaseQueryError | SerializedError) => JSX.Element | JSX.Element[];
    defaultErrorTitle?: undefined;
} | {
    ifError?: undefined;
    defaultErrorTitle: string;
});
type ShowLoadingQueryProps<T> = ShowLoadingQueryErrorProps<T> & ({
    thenRender: (t: NonNullable<T>) => JSX.Element | JSX.Element[];
    children?: undefined;
} | {
    thenRender?: undefined;
    children: JSX.Element | JSX.Element[];
});
// A flexible way of displaying whether a RTKQ query is loading or errored. You can give as props:
//  - Either: `children` or `thenRender` (a function that takes the query data and returns a React element)
//  - Either: `defaultErrorTitle` (the title for the default error component) or `ifError` (a function that takes the query error and produces a React element)
//  - `placeholder` (React element to show while loading)
//  - `query` (the object returned by a RTKQ useQuery hook)
export function ShowLoadingQuery<T>({query, thenRender, children, placeholder, ifError, ifNotFound, defaultErrorTitle}: ShowLoadingQueryProps<T>) {
    const {data, isLoading, isError, error} = query;
    const renderError = () => ifError ? <>{ifError(error)}</> : <DefaultQueryError error={error} title={defaultErrorTitle}/>;
    if (isError && error) {
        return "status" in error && typeof error.status === "number" && [NOT_FOUND, NO_CONTENT].includes(error.status) && ifNotFound ? <>{ifNotFound}</> : renderError();
    }
    if (isLoading) {
        return placeholder ? <>{placeholder}</> : loadingPlaceholder;
    }
    return isDefined(data)
        ? (isFound<T>(data) ? <>{thenRender ? thenRender(data) : children}</> : (ifNotFound ? <>{ifNotFound}</> : renderError()))
        : renderError();
}
