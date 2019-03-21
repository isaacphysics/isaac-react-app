import React from "react";

export const TrustedHTML = ({html}: {html: string}) => {
    // TODO MT Support MathJAX
    return <div dangerouslySetInnerHTML={{__html: html}}></div>
};
