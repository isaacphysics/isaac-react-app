import React from "react";

export const ShowLoading = ({unless, then, ...props}: any) => {
    const ThenComponent = then;
    return unless ? <ThenComponent {...props} /> : <p>Loading...</p>
};
