import {useLocation} from "react-router-dom";
import {Helmet} from "react-helmet";
import React from "react";

export const CanonicalHrefElement = () => {
    let canonicalPath = "";
    const location = useLocation();
    if (location.pathname !== "/") {
        canonicalPath = location.pathname;
    }
    const canonicalHref = `${window.location.origin}${canonicalPath}`;
    return <Helmet>
        <link rel="canonical" href={canonicalHref}/>
    </Helmet>
};
