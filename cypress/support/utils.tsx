
import React from "react";

export const withLocalStorage = (component: React.ReactNode, setter: ((s: Storage) => void)) => {
    const LocalStorageWrapper = ({ children }: { children: React.ReactNode }) => {
        setter(window.localStorage);
        return children;
    };

    return <LocalStorageWrapper>{component}</LocalStorageWrapper>;
};