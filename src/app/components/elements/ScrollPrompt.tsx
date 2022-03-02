import React, {RefObject, useLayoutEffect, useState} from "react";
import {isDefined} from "../../services/miscUtils";
import classNames from "classnames";
import {isTouchDevice} from "../../services/device";

export const ScrollPrompt = <T extends HTMLElement>({scrollRef} : {scrollRef : RefObject<T>}) => {
    const [ direction , setDirection ] = useState<'left' | 'right'>();
    const [ showAtTop , setShowAtTop ] = useState<boolean>();

    useLayoutEffect(() => {
        const listener = () => {
            const element = scrollRef?.current;
            if (!isDefined(element) || isDefined(direction)) {
                return;
            }
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if (element.scrollWidth > element.clientWidth) {
                if (element.getBoundingClientRect().y < (windowHeight * 0.6) && (windowHeight * 0.1) < element.getBoundingClientRect().y) {
                    setDirection('right');
                    setShowAtTop(true);
                    window.removeEventListener("scroll", listener);
                } else if (element.getBoundingClientRect().y + element.getBoundingClientRect().height > (windowHeight * 0.4) && (windowHeight * 0.9) >= element.getBoundingClientRect().y + element.getBoundingClientRect().height) {
                    setDirection('right');
                    setShowAtTop(false);
                    window.removeEventListener("scroll", listener);
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