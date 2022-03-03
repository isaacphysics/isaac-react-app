import React, {RefObject, useLayoutEffect, useState} from "react";
import {isDefined} from "../../services/miscUtils";
import classNames from "classnames";
import {isTouchDevice} from "../../services/device";

// The percentage of the width on screen that the element needs to be overflowing to be given a scroll prompt.
// For example, a value of 1.4 would require the element to be overflowing by more than 40% of its constrained width
// on screen.
const SCROLL_PROMPT_MINIMUM_OVERFLOW = 1.3;

export const ScrollPrompt = <T extends HTMLElement>({scrollRef} : {scrollRef : RefObject<T>}) => {
    const [ direction , setDirection ] = useState<"left" | "right" | "finished">();
    const [ showAtTop , setShowAtTop ] = useState<boolean>();

    useLayoutEffect(() => {
        const listener = () => {
            const element = scrollRef?.current;
            if (!isDefined(element) || isDefined(direction)) {
                return;
            }
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if (element.scrollWidth > (element.clientWidth * SCROLL_PROMPT_MINIMUM_OVERFLOW)) {
                if (element.getBoundingClientRect().y < (windowHeight * 0.6) && (windowHeight * 0.1) < element.getBoundingClientRect().y) {
                    setDirection("right");
                    setShowAtTop(true);
                    window.removeEventListener("scroll", listener);
                    setTimeout(() => setDirection("finished"), 6000);
                } else if (element.getBoundingClientRect().y + element.getBoundingClientRect().height > (windowHeight * 0.4) && (windowHeight * 0.9) >= element.getBoundingClientRect().y + element.getBoundingClientRect().height) {
                    setDirection("right");
                    setShowAtTop(false);
                    window.removeEventListener("scroll", listener);
                    setTimeout(() => setDirection("finished"), 6000);
                }
            }
        }
        window.addEventListener("scroll", listener);
        return () => window.removeEventListener("scroll", listener);
    });

    return <div className={classNames("scroll-arrow", direction)} style={{top: showAtTop ? "50px" : undefined, bottom: showAtTop ? undefined : "80px"}}>
        <span/>
        <span/>
        <span/>
        {isTouchDevice() ? <p>Swipe&nbsp;to&nbsp;scroll</p> : <p>Scroll&nbsp;for&nbsp;more</p>}
    </div>;
}