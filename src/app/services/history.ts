import type {TypeGuard} from "@reduxjs/toolkit/dist/tsHelpers";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

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

// Try to avoid using if possible! prefer `const navigate = useNavigate()` inside a component, and use that instead.
// Intended only for cases where this is not possible (e.g. RTK thunks)
export const navigateComponentless = (to: string, options?: { replace?: boolean; state?: any }): Promise<void> | undefined => {
    const navigate = (window as any).navigateComponentless;
    if (typeof navigate === "function") {
        return navigate(to, options);
    }
};
