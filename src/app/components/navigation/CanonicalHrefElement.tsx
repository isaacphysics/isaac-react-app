import {history} from "../../services/history";
import {Helmet} from "react-helmet";
import React from "react";

export const CanonicalHrefElement = () => {
    let canonicalPath = "";
    if (history.location.pathname !== "/") {
        canonicalPath = history.location.pathname;
    }
    const canonicalHref = `${window.location.origin}${canonicalPath}`;
    return <Helmet>
        <link rel="canonical" href={canonicalHref}/>
    </Helmet>
};
