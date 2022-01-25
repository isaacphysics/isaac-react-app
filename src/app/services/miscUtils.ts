import React, {RefObject, useEffect} from "react";
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {NOT_FOUND} from "./constants";

// undefined|null checker and type guard all-in-wonder.
// Why is this not in Typescript?
export function isDefined<T>(value: T | undefined | null): value is T {
    return <T>value !== undefined && <T>value !== null;
}

// Type guard with checks for "defined"-ness and whether the resource was found or not
export const isFound = <T>(resource: undefined | null | NOT_FOUND_TYPE | T): resource is T => {
    return isDefined(resource) && resource !== NOT_FOUND;
};

// Adapted from answer to stackoverflow.com/questions/32553158
// I'm not sure what the types need to be for contains() to be happy
// Could also look at https://github.com/airbnb/react-outside-click-handler
export function useOutsideCallback(ref: RefObject<any>, callback : () => void, deps : React.DependencyList) {
    useEffect(() => {
        /**
         * Run callback if clicked outside element
         */
        function handleClickOutside(event: Event) {
            if (ref?.current && !ref.current.contains(event.target)) {
                callback();
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [...deps, ref]);
}

export function siteSpecific<P, C>(phy: P, cs: C) {
    if (SITE_SUBJECT === SITE.PHY) {
        return phy;
    }
    return cs;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(x: never) {}