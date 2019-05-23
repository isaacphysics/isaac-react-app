import React, {ReactElement} from "react";
import {Spinner} from "reactstrap";

interface ShowLoadingProps {
    until: any;
    children?: any;
    placeholder?: ReactElement;
}

const defaultPlaceholder = <div className="w-100 text-center">
    <h2 className="pt-5 pb-2">Loading...</h2>
    <Spinner color="primary" />
</div>;

export const ShowLoading = ({until, children, placeholder = defaultPlaceholder}: ShowLoadingProps) => {
    return until ? children : placeholder;
};
