import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useHistoryState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
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
        // don't do anything if the value is already set (would create a new state object and not be reference-equal inside useEffect deps)
        if (value === locationRef.current.state?.[key as keyof typeof locationRef.current.state]) return; 

        void navigate({
            ...locationRef.current,
        }, {
            state: {
                ...locationRef.current.state as Array<string>,
                [key]: value
            },
            replace: true 
        });
        setState(value);

        setLoadedFromHistory(false);
    }, [navigate, key]);

    return [state, setStateAndLocation, loadedFromHistory];
}
