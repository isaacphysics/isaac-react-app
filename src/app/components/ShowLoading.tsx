import React, {ReactElement} from "react";

interface ShowLoadingProps {
    until: any,
    children?: any,
    placeholder?: ReactElement
}

export const ShowLoading = ({until, children, placeholder = <p>Loading...</p>}: ShowLoadingProps) => {
    return until ? children : placeholder;
};
