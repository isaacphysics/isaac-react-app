import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {isDefined} from "../../services";
import classNames from "classnames";

// This allows you to listen for changes in an attribute of some HTMLElement when one of a specified list of events occur.
// It is essentially a setState where the state is also updated by an attribute you are "listening" to.
// For example, `useEventPropertyState(ref, 0, "scrollLeft", ["scroll"]);` will update the state with `ref.current["scrollLeft"]`
// whenever a `scroll` event is caught by a listener attached to `ref.current`.
function useEventPropertyState<T>(element: HTMLElement | undefined, initialState: T, property: string, eventTypes: (keyof HTMLElementEventMap)[], deps: React.DependencyList = []): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialState);

    useEffect(() => {
        if (!element) return;

        setState((element as Record<string, any>)[property] as T);

        const listener = () => {
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
    }, [element, ...deps]);

    return [state, setState];
}

export const ScrollShadows = <T extends HTMLElement>({element} : {element : T | undefined}) => {
    const [clientWidth, setClientWidth] = useState<number>(0);
    const [scrollWidth, setScrollWidth] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useEventPropertyState(element, 0, "scrollLeft", ["scroll"]);

    useEffect(() => {
        if (!element) return;
        const resizeObserver = new ResizeObserver((entries) => {
            const element = entries[0].target;
            setClientWidth(element.clientWidth);
            setScrollWidth(element.scrollWidth);
            setScrollLeft(element.scrollLeft);
        });
        resizeObserver.observe(element);
        return () => resizeObserver.disconnect();
    }, [element]);

    const leftOpacity = scrollLeft > 1
        ? (scrollLeft < 60 ? scrollLeft / 60 : 1)
        : 0;
    const rightOpacity = (scrollWidth - clientWidth) - scrollLeft > 2
        ? ((scrollWidth - clientWidth) - scrollLeft < 60 ? ((scrollWidth - clientWidth) - scrollLeft) / 60 : 1)
        : 0;

    return (scrollWidth - clientWidth) > 5 ? <>
        <div aria-hidden className={classNames("scroll-shadow left")} style={{opacity: leftOpacity}}/>
        <div aria-hidden className={classNames("scroll-shadow right")} style={{opacity: rightOpacity}}/>
    </> : null;
}