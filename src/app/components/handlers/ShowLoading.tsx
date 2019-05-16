import React, {ReactElement} from "react";

interface ShowLoadingProps {
    until: any;
    children?: any;
    placeholder?: ReactElement;
}

export const ShowLoading = ({until, children, placeholder = <h2>Loading...</h2>}: ShowLoadingProps) => {
    return until ? children : placeholder;
};
