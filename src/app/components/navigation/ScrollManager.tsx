import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";

interface ScrollManagerProps {
    location: {pathname: string};
    children: React.ReactElement;
}
const ScrollManagerBase = ({location: {pathname}, children}: ScrollManagerProps) => {
    useEffect(
        () => {window.scrollTo({top: 0, left: 0, behavior: "auto"});},
        [pathname]
    );
    return children;
};

export const ScrollManager = withRouter(ScrollManagerBase);
