import React from "react";

export const ShowLoading = ({until, children, placeholder = <p>Loading...</p>}: any) => {
    return until ? children : placeholder;
};
