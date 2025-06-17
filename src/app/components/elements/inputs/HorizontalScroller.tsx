import classNames from "classnames";
import React from "react";
import { useEffect, useRef, useState } from "react";

export const HorizontalScroller = ({ children, enabled }: { children: React.ReactElement, enabled?: boolean }) => {
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const bottomScrollbarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const [displayScroll, setDisplayScroll] = useState<boolean>(false);

    // Synchronize the scroll position of the top and bottom scrollbars
    const syncScroll = (source: string) => {
        if (enabled) {
            if (source === "top") {
                if (bottomScrollbarRef.current && topScrollbarRef.current) {
                    bottomScrollbarRef.current.scrollLeft = topScrollbarRef.current.scrollLeft;
                }
            } else if (source === "bottom") {
                if (topScrollbarRef.current && bottomScrollbarRef.current) {
                    topScrollbarRef.current.scrollLeft = bottomScrollbarRef.current.scrollLeft;
                }
            }
        }
    };

    useEffect(() => { 
        if (contentRef.current) {
            setContentWidth(contentRef.current.scrollWidth);
        }
    }, [children]);

    useEffect(() => {
        function handleResize() {
            setDisplayScroll(topScrollbarRef.current?.offsetWidth ? topScrollbarRef.current?.offsetWidth < contentWidth : false);
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });

    return (
        <>
            <div className={classNames("top-scrollbar-container", {"closed": !displayScroll || !enabled})} onScroll={() => syncScroll("top")} ref={topScrollbarRef}>
                <div style={{ width: contentWidth }}/>
            </div>
            <div className="overflow-x-auto" ref={bottomScrollbarRef} onScroll={() => syncScroll("bottom")}>
                <div ref={contentRef}>{children}</div>
            </div>
        </>
    );
};
