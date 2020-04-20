import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import {Spinner} from "reactstrap";
import {NOT_FOUND} from "../../services/constants";
import {NotFound} from "../pages/NotFound";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";

interface ShowLoadingProps<T> {
    until: T | NOT_FOUND_TYPE | null | undefined;
    children?: any;
    placeholder?: ReactElement;
    thenRender?: (t: T) => ReactNode;
    ifNotFound?: ReactElement;
}

const defaultPlaceholder = <div className="w-100 text-center">
    <h2 className="pt-5 pb-2">Loading...</h2>
    <Spinner color="primary" />
</div>;

export const ShowLoading = < T extends {} >({until, children, thenRender, placeholder = defaultPlaceholder, ifNotFound = <NotFound />}: ShowLoadingProps<T>) => {
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
    }, [until, children, thenRender]);

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
