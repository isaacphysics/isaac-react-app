import React from "react";

export const TrustedHtml = ({html}: {html: string}) => {
    // TODO MT Support MathJAX
    return <div dangerouslySetInnerHTML={{__html: html}}></div>
};
