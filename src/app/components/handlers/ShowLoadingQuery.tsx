import React, {ReactElement} from "react";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";
import {IsaacSpinner} from "./IsaacSpinner";
import {isDefined} from "../../services";

const loadingPlaceholder = <div className="w-100 text-center pb-2">
    <h2 aria-hidden="true" className="pt-5">Loading...</h2>
    <IsaacSpinner />
</div>;

interface ShowLoadingQueryProps<T> {
    thenRender: (t: NonNullable<T>) => ReactElement;
    placeholder?: ReactElement;
    ifError: (error?: FetchBaseQueryError | SerializedError) => ReactElement;
    query: {
        data?: T;
        isLoading: boolean;
        isError: boolean;
        error?: FetchBaseQueryError | SerializedError;
    };
}
export function ShowLoadingQuery<T>({query, thenRender, placeholder, ifError}: ShowLoadingQueryProps<T>) {
    const {data, isLoading, isError, error} = query;
    if (isError) {
        return ifError(error);
    }
    if (isLoading) {
        return placeholder ?? loadingPlaceholder;
    }
    return isDefined(data) ? thenRender(data) : ifError();
}
