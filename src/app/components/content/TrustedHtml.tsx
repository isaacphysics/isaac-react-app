/*global MathJax*/
import React, {useLayoutEffect, useRef} from "react";

export const TrustedHtml = ({html}: {html: string}) => {
    const itemRef = useRef(null);

    useLayoutEffect((): void => {
        if (itemRef.current) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, itemRef.current]);
        }
    }, [html]);

    return <div ref={itemRef} dangerouslySetInnerHTML={{__html: html}} />;
};
