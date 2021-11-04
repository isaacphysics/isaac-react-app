import React, {RefObject, useEffect} from "react";

// undefined|null checker and type guard all-in-wonder.
// Why is this not in Typescript?
export function isDefined<T>(value: T | undefined | null): value is T {
    return <T>value !== undefined && <T>value !== null;
}

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