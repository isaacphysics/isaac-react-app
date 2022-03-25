import React, {Dispatch, RefObject, SetStateAction, useEffect, useState} from "react";
import {isDefined} from "../../services/miscUtils";
import classNames from "classnames";

function useEventPropertyState<T>(ref: RefObject<HTMLElement>, initialState: T, property: string, eventTypes: (keyof HTMLElementEventMap)[], deps: React.DependencyList = []): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialState);

    useEffect(() => {
        const element = ref?.current;
        if (!element) return;

        setState((element as Record<string, any>)[property] as T);

        const listener = () => {
            const element = ref?.current;
            if (isDefined(element)) {
                setState((element as Record<string, any>)[property] as T);
            }
        }
        eventTypes.map(eventType => {
            element.addEventListener(eventType, listener);
        });

        return () => {
            eventTypes.map(eventType => {
                element.removeEventListener(eventType, listener);
            });
        }
    }, [ref, ...deps]);

    return [state, setState];
}

export const ScrollShadows = <T extends HTMLElement>({scrollRef} : {scrollRef : RefObject<T>}) => {
    const [ clientWidth , setClientWidth ] = useState<number>(0);
    const [ scrollWidth , setScrollWidth ] = useState<number>(0);
    const [ scrollLeft , setScrollLeft ] = useEventPropertyState(scrollRef, 0, "scrollLeft", ["scroll"]);

    useEffect(() => {
        const element = scrollRef?.current;

        const resizeObserver = new ResizeObserver((entries) => {
            const element = entries[0].target;
            setClientWidth(element.clientWidth);
            setScrollWidth(element.scrollWidth);
            setScrollLeft(element.scrollLeft);
        });
        if (element) {
            resizeObserver.observe(element);
        }
        return () => resizeObserver.disconnect();
    }, [scrollRef]);

    const leftOpacity = scrollLeft > 1
        ? (scrollLeft < 60 ? scrollLeft/60 : 1)
        : 0;
    const rightOpacity = (scrollWidth - clientWidth) - scrollLeft > 2
        ? ((scrollWidth - clientWidth) - scrollLeft < 60 ? ((scrollWidth - clientWidth) - scrollLeft)/60 : 1)
        : 0;

    return (scrollWidth - clientWidth) > 5 ? <>
        <div aria-hidden className={classNames("scroll-shadow left")} style={{opacity: leftOpacity}}/>
        <div aria-hidden className={classNames("scroll-shadow right")} style={{opacity: rightOpacity}}/>
    </> : null;
}