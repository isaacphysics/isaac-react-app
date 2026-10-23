import type {TypeGuard} from "@reduxjs/toolkit/dist/tsHelpers";
import {useCallback, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import isEqual from "lodash/isEqual";

function prepareHash<T>(defaultState: T, typeGuard: TypeGuard<T>, hash: string) {
    const hashText = hash.replace("#", "");
    return typeGuard(hashText) ? hashText : defaultState;
}
// Helper hook that manages a state that is semantically stored in the URL hash
export function useHashState<T>(defaultState: T & string, typeGuard: TypeGuard<T & string>): [T & string, (newState: T & string) => void] {
    const {hash, ...location} = useLocation();
    const [hashState, setHashState] = useState<T & string>(prepareHash(defaultState, typeGuard, hash));
    const navigate = useNavigate();
    // Updates the hash, given a new state
    const setHash = (newState: T & string) => {
        try {
            void navigate({...location, hash: newState});
        } catch (e) {}
    };
    // Updates the state, given a new hash
    useEffect(() => {
        const newState = prepareHash(defaultState, typeGuard, hash);
        if (hashState !== newState) {
            setHashState(newState);
        }
    }, [hash]);
    return [hashState, setHash];
}

export function useHistoryState<T>(key: string, initialValue: T, withoutLocationUpdate?: boolean): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
    const navigate = useNavigate();
    const location = useLocation();
    const existingState = location.state?.[key as keyof typeof location.state];
    const [state, setState] = useState<T>(existingState ?? initialValue);
    const [loadedFromHistory, setLoadedFromHistory] = useState(existingState !== undefined);

    // use a ref to track location to ensure it is never stale inside setHistoryAndState, but does not recreate the function on change
    const locationRef = useRef(location);
    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    const setStateAndLocation = useCallback((value: React.SetStateAction<T>) => {
        const existing = locationRef.current.state?.[key as keyof typeof locationRef.current.state] as T;
        const calculated = typeof value === "function" ? (value as (prevState: T) => T)(existing) : value;
        if (!withoutLocationUpdate) {
            // don't do anything if the value is already set (would create a new state object and not be reference-equal inside useEffect deps)
            if (isEqual(calculated, existing)) return;

            void navigate({
                ...locationRef.current,
            }, {
                state: {
                    ...locationRef.current.state as Array<string>,
                    [key]: calculated
                },
                replace: true,
                flushSync: true // ensures history state is updated immediately, so chained useHistoryState calls (with different keys) don't race and overwrite each other
            });
        }
        setState(calculated);

        setLoadedFromHistory(false);
    }, [key, withoutLocationUpdate, navigate]);

    return [state, setStateAndLocation, loadedFromHistory];
}


// Try to avoid using if possible! prefer `const navigate = useNavigate()` inside a component, and use that instead.
// Intended only for cases where this is not possible (e.g. RTK thunks)
export const navigateComponentless = (to: string, options?: { replace?: boolean; state?: any }): Promise<void> | undefined => {
    const navigate = (window as any).navigateComponentless;
    if (typeof navigate === "function") {
        return navigate(to, options);
    }
};
