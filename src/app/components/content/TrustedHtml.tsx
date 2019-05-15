import React from "react";
import {useMathJaxRef} from "../../services/useMathJaxRef";

export const TrustedHtml = ({html, span}: {html: string; span?: boolean}) => {
    const ref = useMathJaxRef([html, span]);
    if (span) {
        return <span ref={ref} dangerouslySetInnerHTML={{__html: html}} />;
    } else {
        return <div ref={ref} dangerouslySetInnerHTML={{__html: html}}/>;
    }
};
