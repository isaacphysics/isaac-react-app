import React from "react";

export const DateString = ({children, defaultValue}: {children: any, defaultValue?: any}) => {
    try {
        return children && new Date(children).toUTCString();
    } catch (e) {
        return defaultValue || "NOT A VALID DATE";
    }
};
