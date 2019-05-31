import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";

const ScrollManagerBase = ({children, location}: any) => {
    useEffect(
        () => {window.scrollTo({top: 0, left: 0, behavior: "auto"});},
        [location]
    );

    return children;
};

export const ScrollManager = withRouter(ScrollManagerBase);
