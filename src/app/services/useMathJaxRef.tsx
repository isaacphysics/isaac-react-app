/*global MathJax*/
import {useLayoutEffect, useRef} from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMathJaxRef(deps: any[]) {
    const itemRef = useRef(null);

    useLayoutEffect((): void => {
        if (itemRef.current) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, itemRef.current]);
        }
    }, deps);

    return itemRef;
}