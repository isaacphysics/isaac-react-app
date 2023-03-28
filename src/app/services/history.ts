import {createBrowserHistory} from "history";
import {registerPageChange} from "../state";
import {TypeGuard} from "@reduxjs/toolkit/dist/tsHelpers";
import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

export const history = createBrowserHistory();

let previousPathname = window.location.pathname;

history.listen(listener => {
    const nextPathname = listener.pathname;
    if (previousPathname != nextPathname) {
        registerPageChange(listener.pathname);
        previousPathname = nextPathname;
    }
});

function prepareHash<T>(defaultState: T, typeGuard: TypeGuard<T>, hash: string) {
    const hashText = hash.replace("#", "");
    return typeGuard(hashText) ? hashText : defaultState;
}
// Helper hook that manages a state that is semantically stored in the URL hash
export function useHashState<T>(defaultState: T & string, typeGuard: TypeGuard<T & string>): [T & string, (newState: T & string) => void] {
    const {hash, ...location} = useLocation();
    const [hashState, setHashState] = useState<T & string>(prepareHash(defaultState, typeGuard, hash));
    // Updates the hash, given a new state
    const setHash = (newState: T & string) => {
        try {
            history.replace({...location, hash: newState});
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
