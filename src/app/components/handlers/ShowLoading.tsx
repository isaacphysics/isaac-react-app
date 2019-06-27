import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import {Spinner} from "reactstrap";
import {NOT_FOUND} from "../../services/constants";
import {NotFound} from "../pages/NotFound";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";

interface ShowLoadingProps<T> {
    until: T | NOT_FOUND_TYPE | null | undefined;
    children?: any;
    placeholder?: ReactElement;
    render?: (t: T) => ReactNode;
}

const defaultPlaceholder = <div className="w-100 text-center">
    <h2 className="pt-5 pb-2">Loading...</h2>
    <Spinner color="primary" />
</div>;

export const ShowLoading = < T extends {} >({until, children, render, placeholder = defaultPlaceholder}: ShowLoadingProps<T>) => {
    const [loadingTimeout, setLoadingTimeout] = useState();
    const [duringLoad, setDuringLoad] = useState(false);
    useEffect( () => {
        clearTimeout(loadingTimeout);
        if (until == null) {
            setDuringLoad(true);
            setLoadingTimeout(setTimeout(() => setDuringLoad(false), 200));
        }
    }, [until, children, render]);

    switch(until) {
        case null:
        case undefined:
            if (duringLoad) {
                return <div className="min-vh-100" />;
            } else {
                return placeholder;
            }
        case NOT_FOUND:
            return <NotFound/>;
        default:
            return children || (render && render(until));
    }
};
