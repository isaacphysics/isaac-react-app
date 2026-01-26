import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { isTouchDevice } from "../../../services";
import debounce from "lodash/debounce";

export interface HorizontalScrollerProps {
    children: React.ReactElement;
    enabled?: boolean;
    className?: string;
}

export const HorizontalScroller = ({ children, enabled, className }: HorizontalScrollerProps) => {
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const bottomScrollbarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const [displayScroll, setDisplayScroll] = useState<boolean>(false);
    const [scrollbarSize, setScrollbarSize] = useState<number>(0);
    enabled = enabled && !isTouchDevice();

    const debouncedScrollEnabler = useMemo(() =>
        debounce((ds: boolean) => {
            setDisplayScroll(ds);

            const bottomScrollBarSize = (bottomScrollbarRef.current?.offsetHeight || 0) - (bottomScrollbarRef.current?.clientHeight || 0);
            setScrollbarSize((enabled && ds) ? (bottomScrollBarSize ? bottomScrollBarSize + 1 : 5) : 0);
        }, 100),
    [enabled]);

    const handleResize = useCallback(() => {
        if (contentRef.current) {
            setContentWidth(contentRef.current.scrollWidth);
        }
        debouncedScrollEnabler(topScrollbarRef.current?.offsetWidth ? topScrollbarRef.current?.offsetWidth < contentWidth : false);
    }, [contentWidth, debouncedScrollEnabler]);

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
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(topScrollbarRef.current as Element);
        return () => resizeObserver.disconnect();
    }, [handleResize]);

    return (
        <div className={classNames(className, "d-grid")}>
            <div className={classNames("top-scrollbar-container", {"closed": !displayScroll || !enabled})} 
                onScroll={() => syncScroll("top")} ref={topScrollbarRef} style={{ height: scrollbarSize }} 
            >
                <div style={{ width: contentWidth }}/>
            </div>
            <div className="overflow-x-auto" ref={bottomScrollbarRef} onScroll={() => syncScroll("bottom")}>
                <div ref={contentRef}>{children}</div>
            </div>
        </div>
    );
};
