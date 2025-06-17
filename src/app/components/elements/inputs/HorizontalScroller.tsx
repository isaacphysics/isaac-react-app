import classNames from "classnames";
import React, { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { isTouchDevice } from "../../../services";
import { debounce } from "lodash";

export const HorizontalScroller = ({ children, enabled, className }: { children: React.ReactElement, enabled?: boolean, className?: string }) => {
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const bottomScrollbarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const [displayScroll, setDisplayScroll] = useState<boolean>(false);
    enabled = enabled && !isTouchDevice();

    const debouncedScrollHandler = useMemo(() =>
        debounce((searchTerm: boolean) => {
            setDisplayScroll(searchTerm);
        }, 100),
    [setDisplayScroll]);

    const handleResize = React.useCallback(() => {
        if (contentRef.current) {
            setContentWidth(contentRef.current.scrollWidth);
        }
        
        debouncedScrollHandler(topScrollbarRef.current?.offsetWidth ? topScrollbarRef.current?.offsetWidth < contentWidth : false);
        console.log("HorizontalScroller: handleResize", topScrollbarRef.current?.offsetWidth, contentWidth, displayScroll, enabled);
    }, [contentWidth, displayScroll, enabled]);

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
        handleResize();
    }, [children, handleResize]);

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });

    return (
        <div className={className}>
            <div className={classNames("top-scrollbar-container", {"closed": !displayScroll || !enabled})} onScroll={() => syncScroll("top")} ref={topScrollbarRef}>
                <div style={{ width: contentWidth }}/>
            </div>
            <div className="overflow-x-auto" ref={bottomScrollbarRef} onScroll={() => syncScroll("bottom")}>
                <div ref={contentRef}>{children}</div>
            </div>
        </div>
    );
};
