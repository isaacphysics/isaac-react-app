import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import {NOT_FOUND} from "../../services";
import {NotFound} from "../pages/NotFound";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {IsaacSpinner} from "./IsaacSpinner";

interface ShowLoadingProps<T> {
    until: T | NOT_FOUND_TYPE | null | undefined;
    children?: any;
    placeholder?: ReactElement;
    thenRender?: (t: T) => ReactNode;
    ifNotFound?: ReactElement;
}

const defaultPlaceholder = <div className="w-100 text-center pb-2">
    <h2 aria-hidden="true" className="pt-5">Loading...</h2>
    <IsaacSpinner />
</div>;

export const ShowLoading = <T extends {}>({until, children, thenRender, placeholder=defaultPlaceholder, ifNotFound=<NotFound />}: ShowLoadingProps<T>) => {
    const [duringLoad, setDuringLoad] = useState(false);
    useEffect( () => {
        let timeout: number;
        if (until == null) {
            setDuringLoad(true);
            timeout = window.setTimeout(() => {
                setDuringLoad(false);
            }, 200);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [until]);

    switch(until) {
        case null:
        case undefined:
            if (duringLoad) {
                return <div className="min-vh-100" />;
            } else {
                return placeholder;
            }
        case NOT_FOUND:
            return ifNotFound;
        default:
            return children || (thenRender && thenRender(until));
    }
};
