import React, {RefObject, useLayoutEffect, useState} from "react";
import {isDefined} from "../../services/miscUtils";
import classNames from "classnames";

export const ScrollPrompt = <T extends HTMLElement>({scrollRef} : {scrollRef : RefObject<T>}) => {
    const [ counter , setCounter ] = useState<number>(0);
    const [ direction , setDirection ] = useState<'left' | 'right'>();

    useLayoutEffect(() => {
        const listener = () => {
            const element = scrollRef?.current;
            if (!isDefined(element) || counter > 15) {
                return;
            }
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            // TODO support if the user scrolls from beneath
            if (element.getBoundingClientRect().y < (windowHeight * 0.6) && element.scrollWidth > element.clientWidth) {
                setCounter(1);
                window.removeEventListener("scroll", listener);
            }
        }
        window.addEventListener("scroll", listener);
        return () => window.removeEventListener("scroll", listener);
    }, []);

    // Check if in window view, if so display for 15*250 millis.
    useLayoutEffect(() => {
        const element = scrollRef?.current;
        if (!isDefined(element) || counter > 15) {
            setDirection(undefined);
            return;
        }
        if (element.scrollWidth > element.clientWidth) {
            const timeoutId = setTimeout(() => {
                // Work out which side is overflowing
                if (element.scrollLeft < 10) {
                    setDirection('right');
                } else if (element.scrollLeft > element.scrollWidth - (element.clientWidth + 10)) {
                    setDirection('left');
                } else {
                    setDirection(undefined);
                }
                setCounter((n) => n + 1);
            }, 250);
            return () => clearTimeout(timeoutId);
        }
    }, [counter]);

    return <div className={classNames("scroll-arrow", direction)}>
        <span/>
        <span/>
        <span/>
    </div>;
}